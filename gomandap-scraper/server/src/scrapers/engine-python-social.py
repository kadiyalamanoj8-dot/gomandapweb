import sys
import json
import time
import argparse
import urllib.parse
import re

try:
    from playwright.sync_api import sync_playwright
except ImportError:
    sync_playwright = None

# Import our AI Helper
from deepseek_helper import call_deepseek_ai

def emit_log(message):
    print(json.dumps({"type": "log", "message": message}), flush=True)

def emit_lead(data):
    print(json.dumps({"type": "lead", "data": data}), flush=True)

def extract_fallback(text):
    phone_match = re.search(r"(?:\+91|0)?[-\s]*[6789]\d{2}[-\s]*\d{3}[-\s]*\d{4}", text)
    email_match = re.search(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}", text)
    return {
        "phones": [phone_match.group(0).strip()] if phone_match else [],
        "emails": [email_match.group(0).strip()] if email_match else []
    }

def main():
    parser = argparse.ArgumentParser(description="Gomandap Social Dork Engine")
    parser.add_argument('--query', required=True) # e.g. 'site:instagram.com photographer in guntur'
    parser.add_argument('--category', required=True)
    parser.add_argument('--location', required=True)
    parser.add_argument('--apikey', required=False)
    args = parser.parse_args()

    query = args.query.strip()
    category = args.category.strip()
    location = args.location.strip()
    api_key = args.apikey

    emit_log(f"[SYSTEM] Python Social Dork Automation Booted for query: {query}")

    if not sync_playwright:
        emit_log("[ERROR] Playwright for Python is not installed.")
        sys.exit(1)

    # We use Google Search to execute the dork to find social media profiles
    search_url = f"https://www.google.com/search?q={urllib.parse.quote(query)}"

    emit_log(f"[Agent] Executing Google Dork: {search_url}")

    with sync_playwright() as p:
        # STEALTH: Use a real user agent
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1280, "height": 800}, user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36")
        page = context.new_page()

        # Abort heavy assets
        page.route("**/*", lambda route: route.abort() if route.request.resource_type in ["image", "media", "font"] else route.continue_())

        try:
            page.goto(search_url, wait_until="domcontentloaded", timeout=30000)
            time.sleep(2)
        except Exception as e:
            emit_log(f"[WARN] Page load timeout, but continuing... {e}")

        # Find Google search result links
        result_links = page.locator('#search a').all()
        target_urls = []
        for link in result_links:
            href = link.get_attribute('href')
            if href and ('instagram.com' in href or 'facebook.com' in href or 'linkedin.com' in href):
                if '/p/' not in href and '/reel/' not in href and 'login' not in href:
                    target_urls.append(href)
        
        target_urls = list(set(target_urls))[:8] # Process top 8 profiles
        emit_log(f"[Agent] Dork found {len(target_urls)} potential social profiles.")

        for i, target_url in enumerate(target_urls):
            emit_log(f"[Extracting] {i+1}/{len(target_urls)}: {target_url}")
            
            try:
                # Open new tab for profile
                profile_page = context.new_page()
                profile_page.route("**/*", lambda route: route.abort() if route.request.resource_type in ["image", "media", "font"] else route.continue_())
                
                profile_page.goto(target_url, wait_until="domcontentloaded", timeout=20000)
                time.sleep(2)
                
                # Get messy text of the profile page
                raw_text = profile_page.inner_text('body')
                profile_page.close()

                # DEEP AI PARSING
                ai_data = call_deepseek_ai(api_key, raw_text, target_type="social")
                
                phones = []
                emails = []
                name = ""
                address = ""

                if ai_data:
                    emit_log(f"   -> AI Parsing Successful for {target_url}")
                    name = ai_data.get('businessName') or f"Social Vendor ({target_url.split('/')[-1][:10]})"
                    phones = ai_data.get('phones', [])
                    emails = ai_data.get('emails', [])
                    address = ai_data.get('address', '')
                else:
                    emit_log(f"   -> Falling back to Regex for {target_url}")
                    fallback = extract_fallback(raw_text)
                    name = f"Social Vendor ({target_url.split('/')[-1][:10]})"
                    phones = fallback['phones']
                    emails = fallback['emails']

                if not phones and not emails:
                    emit_log("   -> No contact info found. Skipping.")
                    continue

                score = 10
                if phones: score += 50
                if emails: score += 20
                if address: score += 10

                lead = {
                    "businessName": name,
                    "category": category,
                    "city": location,
                    "address": address,
                    "phones": phones,
                    "emails": emails,
                    "website": target_url,
                    "mapsLink": target_url,
                    "qualityScore": score,
                    "source": "Python Social Dork + AI"
                }

                emit_lead(lead)
                
            except Exception as e:
                emit_log(f"[WARN] Failed to process profile {target_url}: {str(e)}")

        emit_log("[SYSTEM] Python Social Dork Automation completed successfully.")
        browser.close()

if __name__ == "__main__":
    main()
