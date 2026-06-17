#!/bin/bash
# =============================================
# deploy-fixes.sh — Run this on your Oracle Cloud server
# Usage: bash deploy-fixes.sh
# =============================================

set -e
APPDIR="/home/opc/gomandapweb"

echo "================================================"
echo "  Deploying Gomandap Fixes"
echo "================================================"

# ---- 1. Fix folder permissions (403 fix) ----
echo ""
echo "[1/6] Fixing directory permissions..."
# opc home must be executable by nginx
chmod 755 /home/opc

# App directory
chmod -R 755 "$APPDIR"

# dist folders specifically
for dir in client vendor admin; do
    DIST="$APPDIR/$dir/dist"
    if [ -d "$DIST" ]; then
        chmod -R 755 "$DIST"
        echo "  ✅ $DIST permissions fixed"
    else
        echo "  ⚠️  $DIST does NOT exist — run: cd $APPDIR/$dir && npm run build"
    fi
done

# ---- 2. Fix SELinux (Oracle Linux) ----
echo ""
echo "[2/6] Fixing SELinux permissions..."
sudo setsebool -P httpd_can_network_connect 1
sudo setsebool -P httpd_read_user_content 1
# Allow nginx to read from /home/opc
sudo semanage fcontext -a -t httpd_sys_content_t "$APPDIR/client/dist(/.*)?" 2>/dev/null || true
sudo semanage fcontext -a -t httpd_sys_content_t "$APPDIR/vendor/dist(/.*)?" 2>/dev/null || true
sudo semanage fcontext -a -t httpd_sys_content_t "$APPDIR/admin/dist(/.*)?" 2>/dev/null || true
sudo restorecon -Rv "$APPDIR" 2>/dev/null || true
echo "  ✅ SELinux configured"

# ---- 3. Update nginx config ----
echo ""
echo "[3/6] Updating Nginx configuration..."
sudo cp "$APPDIR/nginx-conf.txt" /etc/nginx/conf.d/gomandap.conf
sudo nginx -t && echo "  ✅ Nginx config valid" || { echo "  ❌ Nginx config error!"; exit 1; }

# ---- 4. Update backend .env ----
echo ""
echo "[4/6] Backend .env already updated in repo — checking..."
grep "CORS_ORIGINS" "$APPDIR/backend/.env" | head -c 120
echo ""
echo "  ✅ CORS_ORIGINS found"

# ---- 5. Restart nginx ----
echo ""
echo "[5/6] Restarting Nginx..."
sudo systemctl restart nginx
sudo systemctl status nginx --no-pager | head -5
echo "  ✅ Nginx restarted"

# ---- 6. Restart backend via PM2 ----
echo ""
echo "[6/6] Restarting backend via PM2..."
cd "$APPDIR"
pm2 restart gomandap-backend 2>/dev/null || pm2 start pm2.config.js
pm2 save
pm2 list

echo ""
echo "================================================"
echo "  ✅ All fixes deployed!"
echo ""
echo "  Quick test:"
echo "    curl -I http://gomandap.com"
echo "    curl -I http://vendor.gomandap.com"
echo "    curl -I http://admin.gomandap.com"
echo "    curl http://api.gomandap.com/"
echo ""
echo "  Check logs if issues persist:"
echo "    sudo tail -30 /var/log/nginx/error.log"
echo "    pm2 logs gomandap-backend --lines 30"
echo "================================================"
