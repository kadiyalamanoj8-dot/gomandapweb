#!/bin/bash
echo "Adding MongoDB repo..."
cat <<EOF | sudo tee /etc/yum.repos.d/mongodb-org-7.0.repo
[mongodb-org-7.0]
name=MongoDB Repository
baseurl=https://repo.mongodb.org/yum/redhat/9/mongodb-org/7.0/x86_64/
gpgcheck=1
enabled=1
gpgkey=https://pgp.mongodb.com/server-7.0.asc
EOF

echo "Installing MongoDB..."
sudo dnf install -y mongodb-org

echo "Starting MongoDB..."
sudo systemctl start mongod
sudo systemctl enable mongod

echo "Updating backend .env..."
sed -i 's|MONGODB_URI=.*|MONGODB_URI=mongodb://localhost:27017/gomandapweb|g' ~/gomandapweb/backend/.env
sed -i '/CLOUDINARY/d' ~/gomandapweb/backend/.env

# Check if UPLOAD_DIR exists, if not add it
if ! grep -q "UPLOAD_DIR" ~/gomandapweb/backend/.env; then
  echo "UPLOAD_DIR=uploads" >> ~/gomandapweb/backend/.env
fi

echo "Pulling latest code and restarting..."
cd ~/gomandapweb
git pull origin main
chmod +x start-production.sh
./start-production.sh
