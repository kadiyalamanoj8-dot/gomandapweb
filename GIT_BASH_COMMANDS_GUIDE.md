# The Master Git Bash & Linux CLI Command Guide
> A complete, structured developer guide from beginner navigation to advanced Oracle Cloud Infrastructure (OCI) server administration.

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

---

## How to convert this guide to a PDF:
If you want to view this guide as a PDF:
1. Open this file (`GIT_BASH_COMMANDS_GUIDE.md`) in **VS Code**.
2. Install the extension called **Markdown PDF** (by *yzane*).
3. Right-click anywhere in the file and select **Markdown PDF: Export (pdf)**. A high-quality PDF will be generated in your folder immediately!



