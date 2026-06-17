#!/bin/bash

echo "======================================================"
echo " Starting SSL Certificate Installation (HTTPS)"
echo "======================================================"

# 1. Install EPEL repository and Certbot
echo "Installing Certbot and Nginx plugin..."
sudo dnf install -y oracle-epel-release-el8 || sudo dnf install -y epel-release
sudo dnf install -y certbot python3-certbot-nginx

# 2. Run Certbot to get and install certificates
# Note: You need to provide a valid email address when prompted by certbot for renewal notices.
echo "Running Certbot to configure HTTPS..."
sudo certbot --nginx -d gomandap.com -d www.gomandap.com -d vendor.gomandap.com -d admin.gomandap.com -d api.gomandap.com --non-interactive --agree-tos -m kadiyalamanoj8@gmail.com

# (Replace the email above with your actual email if needed, or remove the non-interactive flags to run it manually:
# sudo certbot --nginx -d gomandap.com -d www.gomandap.com -d vendor.gomandap.com -d admin.gomandap.com -d api.gomandap.com)

# 3. Setup auto-renewal
echo "Setting up certificate auto-renewal..."
sudo systemctl enable certbot-renew.timer
sudo systemctl start certbot-renew.timer

echo "======================================================"
echo " SSL Setup Complete! Your sites are now secure (HTTPS)."
echo "======================================================"
