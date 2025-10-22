#!/bin/bash

# SSL Setup Script for aicetro.com
# This script will install Let's Encrypt SSL certificates

DOMAIN="aicetro.com"
EMAIL="admin@aicetro.com"  # Change this to your email

echo "================================"
echo "SSL Setup for $DOMAIN"
echo "================================"
echo ""

# Check if certbot is installed
if ! command -v certbot &> /dev/null; then
    echo "Installing Certbot..."
    sudo apt update
    sudo apt install -y certbot python3-certbot-nginx
fi

echo "✅ Certbot installed"
echo ""

# Get SSL certificate
echo "Obtaining SSL certificate from Let's Encrypt..."
echo "This will:"
echo "  1. Get SSL certificate for $DOMAIN, www.$DOMAIN, api.$DOMAIN"
echo "  2. Configure Nginx to use HTTPS (port 443)"
echo "  3. Redirect HTTP to HTTPS"
echo "  4. Setup automatic renewal"
echo ""

sudo certbot --nginx \
    -d $DOMAIN \
    -d www.$DOMAIN \
    -d api.$DOMAIN \
    --email $EMAIL \
    --agree-tos \
    --non-interactive \
    --redirect

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ SSL certificate installed successfully!"
    echo ""
    echo "Your sites are now available at:"
    echo "  - https://aicetro.com (Frontend)"
    echo "  - https://www.aicetro.com (redirects to https://aicetro.com)"
    echo "  - https://api.aicetro.com (Backend API)"
    echo ""
    echo "Certificate will auto-renew every 90 days."
    echo ""
    echo "Next steps:"
    echo "  1. Update .env: NEXT_PUBLIC_API_URL=https://api.aicetro.com/api"
    echo "  2. Restart services: pm2 restart all"
    echo "  3. Test: curl -I https://aicetro.com"
    echo ""
else
    echo ""
    echo "❌ SSL certificate installation failed!"
    echo ""
    echo "Common issues:"
    echo "  1. DNS not propagated yet (wait 10-30 minutes)"
    echo "  2. Port 80 blocked by firewall"
    echo "  3. Domain not pointing to this server"
    echo ""
    echo "Check DNS: dig $DOMAIN +short"
    echo "Should return: 81.91.177.168"
    echo ""
    exit 1
fi
