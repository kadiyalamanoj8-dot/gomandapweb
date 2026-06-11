import sys
import requests
from bs4 import BeautifulSoup
import json
import os
import re
import urllib.parse
import time
import argparse
try:
    from googlesearch import search as gsearch
except ImportError:
    gsearch = None
try:
    from playwright.sync_api import sync_playwright
except ImportError:
    sync_playwright = None

ACTIONS_FILE = os.path.join(os.path.dirname(__file__), "actions.md")
CIRCUIT_BREAKER_TRIPPED = False

def emit_log(message):
    """Outputs a log message formatted as JSON for the Node.js bridge to parse."""
    print(json.dumps({"type": "log", "message": message}), flush=True)

def emit_lead(data):
    """Outputs a successful lead formatted as JSON for the Node.js bridge to insert."""
    print(json.dumps({"type": "lead", "data": data}), flush=True)

def call_deepseek(prompt, api_key, max_tokens=800, max_retries=2):
    global CIRCUIT_BREAKER_TRIPPED
    if CIRCUIT_BREAKER_TRIPPED:
        return None

    headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
    payload = {
        "model": "deepseek-ai/deepseek-v4-pro",
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.1,
        "max_tokens": max_tokens,
        "stream": False
    }
    url = "https://integrate.api.nvidia.com/v1/chat/completions"
    
    for attempt in range(max_retries):
        try:
            # Shortened timeout to 30s so it fails fast, scraper values speed over extreme patience
            res = requests.post(url, json=payload, headers=headers, timeout=30)
            res.raise_for_status()
            content = res.json()['choices'][0]['message']['content']
            return content.replace('```json', '').replace('```', '').strip()
        except requests.exceptions.RequestException as e:
            if attempt < max_retries - 1:
                delay = 2 ** attempt
                emit_log(f"[WARN] AI API timeout/error. Retrying ({attempt+1}/{max_retries}) after {delay}s...")
                time.sleep(delay)
            else:
                emit_log(f"[ERROR] AI API Error after {max_retries} attempts: {e}. TRIPPPING CIRCUIT BREAKER.")
                CIRCUIT_BREAKER_TRIPPED = True
                return None

def load_actions():
    if not os.path.exists(ACTIONS_FILE):
        return ""
    with open(ACTIONS_FILE, "r", encoding="utf-8") as f:
        return f.read()

def append_action(new_rule):
    with open(ACTIONS_FILE, "a", encoding="utf-8") as f:
        f.write(f"\n- {new_rule}\n")
    emit_log(f"[Agent] Memory Updated: Added new rule to actions.md")

def reflect_and_learn(url, raw_text, api_key):
    emit_log(f"[Agent] Reflection Phase: Extraction failed for {url}. Thinking...")
    prompt = f"""
    You are an AI scraping expert. You just failed to extract a business name from the text below.
    Analyze the text and deduce a new rule for how to find the business name or category on this specific type of website.
    Return ONLY a single sentence representing the new rule. Do not use quotes or markdown.
    
    Text snippet:
    {raw_text[:2000]}
    """
    new_rule = call_deepseek(prompt, api_key, max_tokens=100)
    if new_rule:
        append_action(new_rule)

def generate_localities(scope, api_key):
    emit_log(f"[Agent] Geographic Expansion: Asking AI to generate specific localities for '{scope}'")
    prompt = f"""
    The user wants to search within the geographic area: "{scope}".
    Generate a JSON array of up to 5 specific sub-localities (towns, mandals, or key neighborhoods) within this scope.
    Return ONLY a valid JSON array of strings.
    """
    res = call_deepseek(prompt, api_key)
    try:
        return json.loads(res)
    except:
        return [scope]

def search_duckduckgo(query, max_retries=3):
    emit_log(f"[Agent] Searching for targets: '{query}'")
    
    target_urls = []
    if gsearch:
        try:
            # googlesearch-python handles rotation and parsing perfectly
            for url in gsearch(query, num_results=10, sleep_interval=2):
                target_urls.append(url)
            if target_urls:
                return target_urls
        except Exception as e:
            emit_log(f"[WARN] Google search failed: {e}. Falling back...")
    
    # Fallback to DDG Lite
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
    url = "https://lite.duckduckgo.com/lite/"
    data = {'q': query}
    
    for attempt in range(max_retries):
        try:
            res = requests.post(url, headers=headers, data=data, timeout=20)
            soup = BeautifulSoup(res.text, 'html.parser')
            for a in soup.select('a.result-url'):
                href = a.get('href')
                if href and 'duckduckgo' not in href:
                    target_urls.append(href)
            if target_urls:
                return target_urls[:10]
        except Exception:
            pass
        time.sleep(2)
        
    emit_log(f"[ERROR] All search engines failed to find targets.")
    return []

def fast_parse(soup, raw_text):
    # Regex for fast parsing
    phones = list(set(re.findall(r"(?:\+?91|0)?[-\s.]*(?:\d[-\s.]*){10}", raw_text)))
    emails = list(set(re.findall(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}", raw_text)))
    
    # Fast Image Extraction
    extracted_images = []
    for img in soup.find_all('img'):
        src = img.get('src')
        if src and src.startswith('http'):
            if not re.search(r'(logo|icon|avatar|spinner)', src, re.IGNORECASE):
                extracted_images.append(src)
                if len(extracted_images) >= 5:
                    break
                    
    # Address heuristic
    address_match = re.search(r"\d{1,5}\s+[^,]+(?:Street|St|Road|Rd|Avenue|Ave|Boulevard|Blvd|Lane|Ln|Circle|Cir|Square|Sq|Plaza|Plz|Highway|Hwy)", raw_text, re.IGNORECASE)
    address = address_match.group(0) if address_match else ""
    
    return phones, emails, extracted_images, address

def penetrate_dynamic(url):
    emit_log(f"[Agent] Static HTML empty. Escalating to Dynamic SPA Extraction: {url}")
    if not sync_playwright:
        emit_log("[ERROR] Playwright not installed. Skipping dynamic extraction.")
        return None
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            # Block heavy assets to speed up execution
            page.route("**/*", lambda route: route.abort() if route.request.resource_type in ["image", "media", "font"] else route.continue_())
            page.goto(url, wait_until="networkidle", timeout=25000)
            html = page.content()
            browser.close()
            return BeautifulSoup(html, 'html.parser')
    except Exception as e:
        emit_log(f"[ERROR] Dynamic Extraction failed: {e}")
        return None

def penetrate_and_extract(url, api_key):
    emit_log(f"[Agent] Penetrating: {url}")
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
    
    try:
        res = requests.get(url, headers=headers, timeout=25)
        soup = BeautifulSoup(res.text, 'html.parser')
        
        # HYBRID STRATEGY: Check if page is an SPA or mostly empty
        raw_text_check = soup.get_text(separator=' ', strip=True)
        is_spa = bool(soup.find(id="root") or soup.find(id="app") or len(raw_text_check) < 300)
        
        if is_spa:
            dynamic_soup = penetrate_dynamic(url)
            if dynamic_soup:
                soup = dynamic_soup
                
        # 1. FAST PARSE PHASE
        phones, emails, extracted_images, address = fast_parse(soup, soup.get_text(separator=' ', strip=True))
        
        # HTML Stripping for AI
        for script in soup(["script", "style", "noscript"]):
            script.extract()
        raw_text = soup.get_text(separator=' ', strip=True)[:8000]
        
        if len(raw_text) < 50:
            emit_log(f"[Agent] Note: Not enough text extracted from {url}")
            return None
            
        # Load Memory
        memory_rules = load_actions()
            
        # 2. AI EXTRACTION PHASE
        prompt = f"""
        You are an advanced AI data scraper with the following memory of past strategies:
        {memory_rules}
        
        Extract the following from the text below as JSON. Extract aggressively. Even if phone numbers are missing, extract the rest:
        - "businessName": Name of the business (CRITICAL)
        - "category": Exact business category
        - "pricingInfo": Any mentioned pricing, costs, or packages
        - "businessSummary": A 1-2 sentence professional summary of what they do
        - "qualityScore": A number from 0 to 100 rating the professionalism of the text
        
        Text: {raw_text}
        """
        
        ai_response = call_deepseek(prompt, api_key)
        
        if not ai_response:
            emit_log("[WARN] AI extraction failed – using fast parse fallback only")
            return {
                "businessName": "Unknown Lead (Fallback)",
                "category": "Unknown",
                "phones": phones,
                "emails": emails,
                "address": address,
                "pricingInfo": None,
                "businessSummary": "",
                "qualityScore": 0,
                "images": extracted_images,
                "mapsLink": url,
            }

        parsed_data = json.loads(ai_response)
        parsed_data['images'] = extracted_images
        parsed_data['phones'] = phones # Override with fast-parse for 100% accuracy
        parsed_data['emails'] = emails
        if address and not parsed_data.get('address'):
            parsed_data['address'] = address
        parsed_data['mapsLink'] = url
        
        # 3. SELF-REFLECTION PHASE
        if not parsed_data.get("businessName") or parsed_data.get("businessName").lower() in ["unknown", "n/a", "none"]:
            reflect_and_learn(url, raw_text, api_key)
            parsed_data["businessName"] = f"Unidentified Target ({url.split('//')[-1][:15]})"
            
        return parsed_data
        
    except requests.exceptions.Timeout:
        emit_log(f"[ERROR] Timeout exceeded for {url}")
        return None
    except Exception as e:
        emit_log(f"[ERROR] Penetration failed for {url}: {e}")
        return None

def main():
    parser = argparse.ArgumentParser(description="Gomandap Python Engine")
    parser.add_argument('--query', required=True)
    parser.add_argument('--category', required=True)
    parser.add_argument('--location', required=True)
    parser.add_argument('--apikey', required=True)
    args = parser.parse_args()

    query = args.query
    category = args.category
    location = args.location
    api_key = args.apikey

    emit_log("[SYSTEM] Self-Learning Agent Booted.")
    
    # 1. Geographic Expansion
    localities = generate_localities(location, api_key)
    emit_log(f"[Agent] Generated {len(localities)} target localities: {', '.join(localities)}")
    
    # 2. Infinity Loop
    for loc in localities:
        # Use exact raw query. Append locality only if geographic expansion generated extra localities.
        target_query = f"{query} {loc}".strip() if loc else query
        
        urls = search_duckduckgo(target_query)
        if not urls:
            emit_log(f"[Agent] No targets found for EXACT query: '{target_query}'")
            continue
            
        emit_log(f"[Agent] Found {len(urls)} targets for '{target_query}'. Initiating Penetration...")
        
        for url in urls:
            data = penetrate_and_extract(url, api_key)
            if data and (data.get("phones") or data.get("emails") or data.get("address") or data.get("businessSummary")):
                emit_log(f"[SUCCESS] Secured Deep Lead (with or without phone): {data.get('businessName')}")
                emit_lead(data)
            else:
                emit_log(f"[Agent] Target completely missed. No actionable data found.")
                
            time.sleep(1)

    emit_log("[SYSTEM] Python Engine cycle completed successfully.")

if __name__ == "__main__":
    main()
