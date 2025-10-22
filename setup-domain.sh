#!/bin/bash

# Domain Setup Script for aicetro.com
# This script will configure Nginx for the domain after DNS is propagated

DOMAIN="aicetro.com"
SERVER_IP="81.91.177.168"

echo "================================"
echo "Domain Setup for $DOMAIN"
echo "================================"
echo ""

# Check if DNS is propagated
echo "Checking DNS propagation..."
DNS_IP=$(dig +short $DOMAIN | tail -n1)

if [ "$DNS_IP" != "$SERVER_IP" ]; then
    echo "❌ DNS not yet propagated!"
    echo "   Current DNS: $DNS_IP"
    echo "   Expected: $SERVER_IP"
    echo ""
    echo "Please wait for DNS to propagate and run this script again."
    echo "Check DNS status: dig $DOMAIN +short"
    exit 1
fi

echo "✅ DNS is propagated correctly!"
echo "   $DOMAIN → $SERVER_IP"
echo ""

# Backup existing configs
echo "Backing up existing Nginx configs..."
sudo cp /etc/nginx/sites-available/frontend /etc/nginx/sites-available/frontend.bak 2>/dev/null || true
sudo cp /etc/nginx/sites-available/aicetro-backend /etc/nginx/sites-available/aicetro-backend.bak 2>/dev/null || true

# Create new Nginx config for frontend
echo "Creating Nginx config for $DOMAIN..."
sudo tee /etc/nginx/sites-available/aicetro-frontend > /dev/null << 'EOF'
# Frontend - aicetro.com
server {
    listen 80;
    listen [::]:80;
    server_name aicetro.com www.aicetro.com;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Proxy to Next.js frontend
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Next.js HMR
    location /_next/webpack-hmr {
        proxy_pass http://127.0.0.1:3000/_next/webpack-hmr;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
EOF

# Create new Nginx config for API
echo "Creating Nginx config for api.$DOMAIN..."
sudo tee /etc/nginx/sites-available/aicetro-api > /dev/null << 'EOF'
# Backend API - api.aicetro.com
server {
    listen 80;
    listen [::]:80;
    server_name api.aicetro.com;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Proxy to Node.js backend
    location / {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # CORS headers
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type, X-Requested-With' always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;
        
        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' '*';
            add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS';
            add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type, X-Requested-With';
            add_header 'Access-Control-Max-Age' 1728000;
            add_header 'Content-Type' 'text/plain charset=UTF-8';
            add_header 'Content-Length' 0;
            return 204;
        }
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
EOF

# Enable sites
echo "Enabling sites..."
sudo ln -sf /etc/nginx/sites-available/aicetro-frontend /etc/nginx/sites-enabled/aicetro-frontend
sudo ln -sf /etc/nginx/sites-available/aicetro-api /etc/nginx/sites-enabled/aicetro-api

# Disable old configs
sudo rm -f /etc/nginx/sites-enabled/frontend
sudo rm -f /etc/nginx/sites-enabled/aicetro-backend

# Test Nginx config
echo "Testing Nginx configuration..."
if sudo nginx -t; then
    echo "✅ Nginx config is valid"
else
    echo "❌ Nginx config has errors!"
    echo "Restoring backup..."
    sudo cp /etc/nginx/sites-available/frontend.bak /etc/nginx/sites-available/frontend 2>/dev/null || true
    sudo cp /etc/nginx/sites-available/aicetro-backend.bak /etc/nginx/sites-available/aicetro-backend 2>/dev/null || true
    exit 1
fi

# Reload Nginx
echo "Reloading Nginx..."
sudo systemctl reload nginx

echo ""
echo "✅ Nginx configured successfully!"
echo ""
echo "Current setup:"
echo "  - http://aicetro.com → Frontend (port 3000)"
echo "  - http://api.aicetro.com → Backend API (port 4000)"
echo ""
echo "Next steps:"
echo "  1. Test: curl -I http://aicetro.com"
echo "  2. Test: curl http://api.aicetro.com/api/health"
echo "  3. Run SSL setup: sudo ./setup-ssl.sh"
echo ""
