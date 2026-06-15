#!/bin/bash

echo "======================================================"
echo " Starting Nginx Installation and Setup"
echo "======================================================"

# 1. Install Nginx
echo "Installing Nginx..."
sudo dnf install -y nginx

# 2. Open Firewall Ports for HTTP (80) and HTTPS (443)
echo "Opening Firewall for Web Traffic..."
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload

# 3. Create Nginx Configuration
echo "Writing Nginx Configuration..."
cat << 'EOF' | sudo tee /etc/nginx/conf.d/gomandap.conf
server {
    listen 80;
    server_name gomandap.com www.gomandap.com;
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

server {
    listen 80;
    server_name vendor.gomandap.com;
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

server {
    listen 80;
    server_name admin.gomandap.com;
    location / {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

server {
    listen 80;
    server_name api.gomandap.com;
    client_max_body_size 50M;
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# 4. Fix SELinux permissions (Oracle Linux strict security)
# This allows Nginx to act as a reverse proxy
echo "Configuring SELinux to allow Nginx proxy..."
sudo setsebool -P httpd_can_network_connect 1

# 5. Enable and Restart Nginx
echo "Restarting Nginx..."
sudo systemctl enable nginx
sudo systemctl restart nginx

echo "======================================================"
echo " Nginx Setup Complete!"
echo " Your domains are now configured on the server."
echo "======================================================"
