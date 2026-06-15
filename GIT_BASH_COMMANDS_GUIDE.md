# The Master Git Bash & Linux CLI Command Guide
> A complete, structured developer guide from beginner navigation to advanced Oracle Cloud Infrastructure (OCI) server administration.

---

## 🌟 The Beginner's Story: How Gomandap Actually Works (Start Here!)

If you are a beginner, looking at dozens of commands can be overwhelming. Before you use the commands below, read this short story to understand **exactly** how your Gomandap website works from top to bottom.

### 1. The Oracle Cloud VM (Your "Computer in the Sky")
Instead of running the website on your physical Windows laptop, we rented a virtual computer from Oracle. This computer runs **Oracle Linux 9**. Because it doesn't have a monitor or keyboard, you control it remotely from your Windows computer using a secure tunnel called **SSH** (Secure Shell). When you open Git Bash and type `ssh -i ... opc@68.233.97.93`, you are literally logging your keyboard into that computer in the sky.

### 2. GitHub (The Code Transporter)
When you edit code in VS Code on Windows, the Oracle VM has no idea you made changes. To get your code to the VM, we use **Git** and **GitHub**. 
1. You `git push` your code from Windows up to GitHub (the middleman).
2. You log into the Oracle VM via SSH and type `git pull`. The VM reaches out to GitHub and downloads your new code!

### 3. MongoDB & Multer (The Self-Hosted Brain)
Every website needs a place to store text (Database) and a place to store images (Object Storage). 
- **The Database:** We installed **MongoDB Community Edition** directly onto your Oracle VM. Your backend connects to it at `mongodb://localhost:27017`. All user passwords, vendor profiles, and bookings live safely on your VM's hard drive.
- **The Images:** We told a tool called **Multer** to save every uploaded photo into a folder named `backend/uploads`. Your server's hard drive (up to 200GB) holds all of this for free!

### 4. Vite & PM2 (The Always-On Servers)
You have 4 separate projects: **Backend (Node.js)**, **Client (Vite)**, **Vendor (Vite)**, and **Admin (Vite)**.
If you started these normally by typing `npm start`, they would instantly shut down the moment you closed your SSH terminal window. 
To fix this, we use **PM2**. PM2 is a "Process Manager." We told PM2 to launch all 4 of your projects and run them invisibly in the background. PM2 promises to keep them running 24/7, and if they ever crash, PM2 instantly restarts them!
- Client runs on **Port 3000**
- Vendor runs on **Port 3001**
- Admin runs on **Port 3002**
- Backend runs on **Port 5000**

### 5. Nginx & Cloudflare (The Traffic Cops)
Your users don't want to type `http://68.233.97.93:3000` to visit your website. They want to type `gomandap.com`.
Here is the exact journey a user takes when they type `gomandap.com`:
1. **Cloudflare:** The user types `gomandap.com`. Cloudflare looks up the IP address and acts as a massive shield, encrypting the connection (HTTPS) and forwarding the user's traffic to your Oracle VM's **Port 80** (the standard internet port).
2. **Oracle Firewall:** Oracle checks its Security Rules. Because we opened Port 80, Oracle allows the traffic inside the VM.
3. **Nginx:** Nginx is a "Reverse Proxy" sitting on Port 80. Nginx is the receptionist. It looks at the traffic and says, *"Ah, you asked for `vendor.gomandap.com`! I'm going to secretly forward you to PM2's Port 3001."* 

And that is exactly how your full-stack enterprise architecture works! 

---

## 1. Beginner Commands (Local File & Folder Navigation)
Use these locally in Git Bash to move around your project files and manage directories on Windows.

| Command | Action | Example |
| :--- | :--- | :--- |
| `pwd` | Print Working Directory (shows where you are) | `pwd` |
| `ls` | List files and folders in the current directory | `ls` |
| `ls -la` | List all files (including hidden ones like `.env` or `.git`) | `ls -la` |
| `cd <path>` | Change Directory (move to a folder) | `cd client` |
| `cd ..` | Move up one folder level | `cd ..` |
| `mkdir <name>` | Create a new folder | `mkdir assets` |
| `rm <file>` | Delete a file permanently | `rm temp.js` |
| `rm -rf <dir>` | Delete a folder and all its contents **(Careful!)** | `rm -rf node_modules` |
| `cp <src> <dest>` | Copy a file | `cp .env.example .env` |
| `mv <src> <dest>` | Move or rename a file | `mv config.js settings.js` |
| `clear` | Clear the terminal screen | `clear` |

---

## 2. Git Commands (Version Control & Synchronization)
Synchronize your code with GitHub and track revisions.

### Beginner Git
* **Check project changes status:**
  ```bash
  git status
  ```
* **See exactly what changed in the files:**
  ```bash
  git diff
  ```
* **Stage files for commit:**
  ```bash
  git add . # Stages all files
  git add backend/server.js # Stages a specific file
  ```
* **Commit your staged changes:**
  ```bash
  git commit -m "Your description here"
  ```
* **Push committed changes to GitHub:**
  ```bash
  git push origin main
  ```
* **Pull latest changes from GitHub:**
  ```bash
  git pull origin main
  ```

### Advanced Git
* **Discard all local uncommitted changes:**
  ```bash
  git restore .
  ```
* **Save uncommitted work temporarily without committing:**
  ```bash
  git stash
  ```
* **Retrieve stashed changes:**
  ```bash
  git stash pop
  ```
* **View commit history logs:**
  ```bash
  git log --oneline -n 10
  ```

---

## 3. Remote Server Connection (SSH & SCP)
Commands to securely connect to your VM and copy files back and forth.

* **Log into your OCI VM Instance (via SSH):**
  ```bash
  ssh -i "/c/Users/manoj/.ssh/id_rsa_oci" opc@68.233.97.93
  ```
* **Force-close a frozen SSH session:**
  Press `Enter`, then type `~.` (tilde followed by a period).
* **Upload a file from Windows to the VM (via SCP):**
  ```bash
  scp -i "/c/Users/manoj/.ssh/id_rsa_oci" "C:/Users/manoj/Downloads/file.txt" opc@68.233.97.93:~/gomandapweb/
  ```
* **Upload a folder recursively to the VM:**
  ```bash
  scp -i "/c/Users/manoj/.ssh/id_rsa_oci" -r "./config" opc@68.233.97.93:~/gomandapweb/backend/
  ```

---

## 4. Remote Server Admin (Once logged into the VM)
Commands to manage the Oracle Linux environment, firewalls, and packages.

### System & Memory Management
* **Check disk space availability:**
  ```bash
  df -h
  ```
* **Check RAM and Swap file usage in real-time:**
  ```bash
  free -h
  ```
* **Monitor running processes and CPU/RAM usage:**
  ```bash
  top # (Press 'q' to exit)
  ```
* **Force-kill a stuck process by PID:**
  ```bash
  sudo kill -9 <PID>
  ```

### Package Manager (DNF)
* **Install a package:**
  ```bash
  sudo dnf install <package-name> -y
  ```
* **Clean package metadata caches:**
  ```bash
  sudo dnf clean all
  ```
* **Enable a specific repository:**
  ```bash
  sudo dnf install <package> --enablerepo=ol9_developer_EPEL -y
  ```

### Linux Firewall (firewalld)
* **Check all currently open ports:**
  ```bash
  sudo firewall-cmd --list-ports
  ```
* **Open a new port permanently (e.g. Port 5000):**
  ```bash
  sudo firewall-cmd --add-port=5000/tcp --permanent
  sudo firewall-cmd --reload
  ```

---

## 5. Node.js & Process Management (PM2)
Manage and run your servers in the background so they keep running even when you disconnect.

* **Launch servers using PM2 config:**
  ```bash
  npx pm2 start pm2.config.js
  ```
* **List all running PM2 processes:**
  ```bash
  npx pm2 list
  ```
* **Show logs for all apps in real-time:**
  ```bash
  npx pm2 logs
  ```
* **Show logs for a specific application:**
  ```bash
  npx pm2 logs gomandap-backend
  ```
* **Restart an application:**
  ```bash
  npx pm2 restart gomandap-backend
  ```
* **Stop an application:**
  ```bash
  npx pm2 stop gomandap-backend
  ```
* **Save the current process list (so it auto-starts on reboot):**
  ```bash
  npx pm2 save
  ```

---

## 6. Running Gomandap Applications Locally (Windows)
How to start development servers and install packages for each specific app on your local computer.

### Installing Dependencies (Run in each folder if node_modules is missing)
* **Backend:** `cd backend && npm install`
* **Client App:** `cd client && npm install`
* **Vendor App:** `cd vendor && npm install`
* **Admin App:** `cd admin && npm install`

### Local Development Start Commands
* **Backend API (Port 5000):**
  ```bash
  cd backend && npm start
  ```
* **Client App (Public Portal - Port 5173):**
  ```bash
  cd client && npm run dev
  ```
* **Vendor App (Merchant Dashboard - Port 5174):**
  ```bash
  cd vendor && npm run dev
  ```
* **Admin App (Superuser Portal - Port 5175):**
  ```bash
  cd admin && npm run dev
  ```

### Automated Local Dev Run (Windows)
Run the script to install dependencies and build all frontends in one command:
```powershell
.\start-production.ps1
```

---

## 7. Deploying Frontend Apps to Firebase Hosting
Build and upload compiled static assets to the cloud.

### Build Production Bundles (Runs before deployment)
* **Build Client App:** `cd client && npm run build`
* **Build Vendor App:** `cd vendor && npm run build`
* **Build Admin App:** `cd admin && npm run build`
* **Build All Apps simultaneously:**
  ```bash
  npm run build:all
  ```

### Deploy to Firebase
* **Deploy Client App only:**
  ```bash
  firebase deploy --only hosting:client
  ```
* **Deploy Vendor App only:**
  ```bash
  firebase deploy --only hosting:vendor
  ```
* **Deploy Admin App only:**
  ```bash
  firebase deploy --only hosting:admin
  ```
* **Deploy All Frontend Apps simultaneously:**
  ```bash
  npm run deploy:all
  ```

---

## 8. Oracle Linux System & Service Administration
Useful commands to manage services, system status, users, and permissions inside the Oracle Linux VM.

### System Actions
* **Reboot the operating system immediately:**
  ```bash
  sudo reboot
  ```
* **Shutdown the operating system immediately:**
  ```bash
  sudo shutdown -h now
  ```
* **View system logs (syslog):**
  ```bash
  sudo journalctl -n 100 -f
  ```

### Systemd Service Management
* **Start a system service:**
  ```bash
  sudo systemctl start <service_name>
  ```
* **Stop a system service:**
  ```bash
  sudo systemctl stop <service_name>
  ```
* **Restart a system service:**
  ```bash
  sudo systemctl restart <service_name>
  ```
* **Check the status of a system service:**
  ```bash
  sudo systemctl status <service_name>
  ```
* **Enable a service to start automatically on system boot:**
  ```bash
  sudo systemctl enable <service_name>
  ```
* **Disable a service from starting on system boot:**
  ```bash
  sudo systemctl disable <service_name>
  ```

### Permissions and Ownership
* **Change owner of a file/folder:**
  ```bash
  sudo chown -r opc:opc /path/to/folder
  ```
* **Add read/write permissions for user only:**
  ```bash
  chmod 600 keyfile.key
  ```
* **Add execute permission to a script:**
  ```bash
  chmod +x script.sh
  ```

---

## 9. Network Diagnostic & Debugging Commands
Troubleshoot connectivity between Windows, Oracle Cloud VM, and third-party APIs.

### Checking Ports & Listeners (Run on VM)
* **Check all active TCP listening ports and processes:**
  ```bash
  sudo ss -tulpn
  ```
* **Check if a specific port (e.g. 5000) is actively listening:**
  ```bash
  sudo ss -tulpn | grep 5000
  ```
* **Check local connection using curl (loopback test):**
  ```bash
  curl -I http://localhost:5000/
  ```

### Network Connectivity Checks (Run on Local PC or VM)
* **Test network latency to the VM (ICMP Ping):**
  ```bash
  ping 68.233.97.93
  ```
* **Query DNS records for domain resolution:**
  ```bash
  nslookup gomandap.com
  ```
* **Trace network packets path to see where connection drops:**
  ```bash
  tracert 68.233.97.93 # (Windows Command Prompt)
  traceroute 68.233.97.93 # (Linux VM / WSL)
  ```
* **Test if a specific port is reachable over the internet (Telnet/NC):**
  ```bash
  nc -zv 68.233.97.93 5000 # (Tests if Backend Port 5000 is open in Cloud Security Lists)
  nc -zv 68.233.97.93 3389 # (Tests if Remote Desktop Port 3389 is open)
  ```

---

## 10. Step-by-Step Initial Cloud Deployment Workflow
The complete end-to-end recipe used to deploy the Gomandap ecosystem backend and frontends onto the OCI VM.

### Step 1: Secure the SSH Key Locally (Git Bash)
Before connecting, set up the SSH key inside your secure `.ssh` folder:
```bash
cp "/c/Users/manoj/Downloads/ssh-key-2026-06-15 (1).key" "/c/Users/manoj/.ssh/id_rsa_oci"
chmod 600 "/c/Users/manoj/.ssh/id_rsa_oci"
```

### Step 2: Clone the Project on the VM (SSH)
Log into the VM and download the code from GitHub:
```bash
# Log in
ssh -i "/c/Users/manoj/.ssh/id_rsa_oci" opc@68.233.97.93

# Install git if missing
sudo dnf install git -y

# Clone repo
git clone https://github.com/kadiyalamanoj8-dot/gomandapweb.git
exit
```

### Step 3: Upload all Environment Configuration Files (Git Bash Local)
Run these commands in your Windows Git Bash window to copy over the secret `.env` files:
```bash
scp -i "/c/Users/manoj/.ssh/id_rsa_oci" "/c/Users/manoj/OneDrive/Desktop/Gomandapweb/backend/.env" opc@68.233.97.93:~/gomandapweb/backend/.env
scp -i "/c/Users/manoj/.ssh/id_rsa_oci" "/c/Users/manoj/OneDrive/Desktop/Gomandapweb/client/.env" opc@68.233.97.93:~/gomandapweb/client/.env
scp -i "/c/Users/manoj/.ssh/id_rsa_oci" "/c/Users/manoj/OneDrive/Desktop/Gomandapweb/vendor/.env" opc@68.233.97.93:~/gomandapweb/vendor/.env
scp -i "/c/Users/manoj/.ssh/id_rsa_oci" "/c/Users/manoj/OneDrive/Desktop/Gomandapweb/admin/.env" opc@68.233.97.93:~/gomandapweb/admin/.env
scp -i "/c/Users/manoj/.ssh/id_rsa_oci" "/c/Users/manoj/OneDrive/Desktop/Gomandapweb/admin/.env.local" opc@68.233.97.93:~/gomandapweb/admin/.env.local
```

### Step 4: Run the VM Setup and Launch Services (SSH)
Log back into the VM and run the automated deployment script:
```bash
# Log back in
ssh -i "/c/Users/manoj/.ssh/id_rsa_oci" opc@68.233.97.93

# Enter folder, make script executable, and run!
cd ~/gomandapweb
chmod +x start-production.sh
./start-production.sh
```

---

## Oracle Cloud VM Infrastructure Setup (Dependencies)

If you are setting up a brand new Oracle Cloud VM, you need to install Node.js and the local MongoDB database before your applications will run.

### 1. Install Node.js (v20)
```bash
sudo dnf module enable nodejs:20 -y
sudo dnf install nodejs -y
```

### 2. Install MongoDB Community Edition (Open-Source)
```bash
# Add MongoDB repository
cat <<EOF | sudo tee /etc/yum.repos.d/mongodb-org-7.0.repo
[mongodb-org-7.0]
name=MongoDB Repository
baseurl=https://repo.mongodb.org/yum/redhat/9/mongodb-org/7.0/x86_64/
gpgcheck=1
enabled=1
gpgkey=https://pgp.mongodb.com/server-7.0.asc
EOF

# Install MongoDB
sudo dnf install -y mongodb-org

# Start and enable the MongoDB service so it runs automatically on boot
sudo systemctl start mongod
sudo systemctl enable mongod
```

### 3. Updating Backend Environment for Local Storage
Since Git ignores `.env` files, you must update it on the VM so it connects to the local MongoDB instead of Atlas. You can run this automated block to do it instantly:

```bash
sed -i 's|MONGODB_URI=.*|MONGODB_URI=mongodb://localhost:27017/gomandapweb|g' ~/gomandapweb/backend/.env
sed -i '/CLOUDINARY/d' ~/gomandapweb/backend/.env
if ! grep -q "UPLOAD_DIR" ~/gomandapweb/backend/.env; then
  echo "UPLOAD_DIR=uploads" >> ~/gomandapweb/backend/.env
fi
```

### Note on Node.js Warnings (`EBADENGINE`)
During `npm install`, you may occasionally see warnings like `npm warn EBADENGINE Unsupported engine`. This happens when a package (like `firebase-admin`) prefers a slightly newer version of Node.js (e.g., Node 22) but you are running Node 20. 
**This is completely safe to ignore.** Node 20 is the stable standard for Oracle Linux and will run these packages perfectly fine.

### Note on Vulnerabilities (`npm audit fix --force`)
The deployment script automatically runs `npm audit fix --force` after installing dependencies. This automatically updates vulnerable packages to secure versions. If you see warnings about vulnerabilities, the script has already done its best to fix them automatically!

### 4. PM2 Process Management & Logs (Crucial Commands)
Once your backend is running, it runs invisibly in the background using PM2. You will need these commands to monitor it:

```bash
# View the live server logs (Press Ctrl+C to exit)
npx pm2 logs

# View logs for the backend only (if you have multiple apps)
npx pm2 logs gomandap-backend

# Clear/delete all old logs if they get too big
npx pm2 flush

# Check the status, uptime, and memory usage of the server
npx pm2 status

# Restart the backend manually
npx pm2 restart gomandap-backend

# Stop the backend manually
npx pm2 stop gomandap-backend
```

### 5. Opening the Firewall (Fixing "Connection Timed Out")
If you cannot reach your server in your browser, your firewall is blocking the ports. You must open Port 5000 (Backend) and Ports 3000-3002 (Frontends) in two places:

**Step A: Open Ports on the VM**
```bash
sudo firewall-cmd --permanent --add-port=5000/tcp
sudo firewall-cmd --permanent --add-port=3000-3002/tcp
sudo firewall-cmd --reload
```

**Step B: Open Ports in Oracle Cloud Console (CRITICAL)**
1. Log into your **Oracle Cloud Console** in your browser.
2. Go to **Networking -> Virtual Cloud Networks**.
3. Click your VCN, then click **Security Lists**.
4. Click on the Default Security List.
5. Click **Add Ingress Rules**.
6. Set **Source CIDR** to `0.0.0.0/0`.
7. Set **Destination Port Range** to `3000-5000` and click Add.

---

## Architecture Summary: How Your Full Stack Works Now

We have successfully migrated your entire stack to be **100% self-hosted** on your Oracle VM. Here is exactly what I changed and how it works:

### 1. Database (MongoDB)
- **Previously:** You were using **MongoDB Atlas** (a third-party cloud database) which had a 512MB storage limit.
- **Now:** I installed the **MongoDB Community Edition** directly onto your Oracle VM. 
- **How it works:** Your backend connects to `mongodb://localhost:27017`. All of your user data, vendor data, and settings are saved directly to your VM's hard drive, using your Oracle Cloud storage capacity (which is typically 50GB-200GB on the Free Tier!).

### 2. Object Storage (Images/Uploads)
- **Previously:** You were using **Cloudinary** to store images. Multer would intercept uploads and send them to Cloudinary's servers.
- **Now:** I removed Cloudinary completely. I rewrote your `backend/middleware/upload.js` to use `multer.diskStorage()`.
- **How it works:** When a vendor uploads a portfolio image, it is saved directly to the `backend/uploads/` folder on your VM. Your Express server then serves these images statically via the `/uploads/` URL path.

### 3. Serving the Frontend Apps (Client, Vendor, Admin)
- **Previously:** The frontend apps were not being served.
- **Now:** I updated `pm2.config.js` to automatically use PM2's built-in static web server to host all three of your Vite apps.
- **How it works:** 
  - **Client App:** Available at `http://68.233.97.93:3000`
  - **Vendor App:** Available at `http://68.233.97.93:3001`
  - **Admin App:** Available at `http://68.233.97.93:3002`

### 5. Deployment Automation (`start-production.sh`)
- **Previously:** Deployments required manual git pulls and manual PM2 restarts, and sometimes failed if files were edited locally on the server.
- **Now:** The `start-production.sh` script has been fully upgraded to handle enterprise-level deployment.
- **How it works:** 
  1. It uses `git reset --hard HEAD` and `git pull` to guarantee the server always mirrors GitHub perfectly.
  2. It automatically runs `npm audit fix --force` across all 4 applications (backend, client, vendor, admin) to automatically resolve dependency vulnerabilities during the build process.
  3. It builds all static Vite apps and triggers a `pm2 reload` for zero-downtime restarts.

---

## Phase 6: Custom Domains (Cloudflare & Nginx)

If you want to access your sites using a custom domain (like `gomandap.com`) instead of typing IP addresses and ports, we have configured **Nginx** as a Reverse Proxy. Nginx silently forwards traffic from standard web ports (80/443) to your PM2 ports in the background.

### Step 1: Add DNS Records in Cloudflare
Log into your Cloudflare dashboard, go to **DNS -> Records**, and add these **4 A Records**:
1. **Type:** `A` | **Name:** `@` *(or gomandap.com)* | **IPv4 address:** `68.233.97.93` | **Proxy status:** Proxied
2. **Type:** `A` | **Name:** `vendor` | **IPv4 address:** `68.233.97.93` | **Proxy status:** Proxied
3. **Type:** `A` | **Name:** `admin` | **IPv4 address:** `68.233.97.93` | **Proxy status:** Proxied
4. **Type:** `A` | **Name:** `api` | **IPv4 address:** `68.233.97.93` | **Proxy status:** Proxied

*Important: Go to Cloudflare's **SSL/TLS -> Overview** page and make sure your encryption mode is set to **Flexible**.*

### Step 2: Run the Nginx Setup Script
Run this script on your Oracle VM to automatically install Nginx and map the domains to PM2:
```bash
cd ~/gomandapweb
chmod +x setup-nginx.sh
./setup-nginx.sh
```
*Note: The Nginx script specifically configures `client_max_body_size 50M;` for the backend. This ensures your users can upload high-resolution images up to 50 Megabytes without Nginx throwing a "413 Payload Too Large" error.*

### Step 3: Open Port 80 on Oracle Cloud
Since real domains use Port 80, you must open it in your Oracle Cloud Console:
1. Go to **Networking -> Virtual Cloud Networks -> Security Lists**.
2. Click **Add Ingress Rules**.
3. **Stateless:** UNCHECKED (No)
4. **Source CIDR:** `0.0.0.0/0`
5. **Destination Port Range:** `80`

### Step 4: Fix "Mixed Content" Errors (API URL)
Once your domains are working via HTTPS, your browser will block the frontends from talking to the old unsecure `http://68.233.97.93:5000` IP. 
You must update your frontend `.env` files (`client/.env`, `vendor/.env`, `admin/.env`) to point to the secure API:
```env
VITE_API_URL=https://api.gomandap.com
```
Then run `./start-production.sh` to rebuild the frontends with the new secure URL!

---

## Phase 7: Data & Storage Limits (No more limits!)

Because we migrated off third-party platforms (MongoDB Atlas and Cloudinary), your entire database and all uploaded images are stored directly on the Oracle Cloud VM's Block Volume Storage. 

You are no longer bound by 512MB free limits! You now have access to your server's entire hard drive capacity (up to 200GB on the Oracle Always Free Tier).

**How to check your remaining storage capacity at any time:**
```bash
# Check the total size and available space on your hard drive
df -h /
```
Under the `Size` column you will see your total VM hard drive size, and under `Avail` you will see exactly how many Gigabytes of storage you have remaining for vendor portfolio images and database records.

---

## How to convert this guide to a PDF:
If you want to view this guide as a PDF:
1. Open this file (`GIT_BASH_COMMANDS_GUIDE.md`) in **VS Code**.
2. Install the extension called **Markdown PDF** (by *yzane*).
3. Right-click anywhere in the file and select **Markdown PDF: Export (pdf)**. A high-quality PDF will be generated in your folder immediately!



