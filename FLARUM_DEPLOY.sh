#!/usr/bin/env bash
# ============================================================
# FLARUM_DEPLOY.sh — Flarum Forum Deployment Script
# Target: bbs.jueshi.net on Ubuntu/Debian VPS
# Usage: sudo bash FLARUM_DEPLOY.sh
# ============================================================
set -euo pipefail

# ─── Configuration ──────────────────────────────────────────
FLARUM_DOMAIN="bbs.jueshi.net"
FLARUM_DIR="/var/www/flarum"
PHP_FPM_POOL="www"         # default pool name on Ubuntu
DB_NAME="flarum"
DB_USER="flarum"
DB_PASS="Flarum2026!Secure"    # ← Change after first run!
ADMIN_EMAIL="admin@jueshi.net"
ADMIN_USER="admin"
ADMIN_PASS="FlarumAdm1n!2026"  # ← Change after first run!

# ─── Pre-flight checks ──────────────────────────────────────
if [[ $EUID -ne 0 ]]; then
  echo "⚠️  This script must be run as root (sudo bash FLARUM_DEPLOY.sh)"
  exit 1
fi

if [[ -z "$DB_PASS" || -z "$ADMIN_EMAIL" || -z "$ADMIN_USER" || -z "$ADMIN_PASS" ]]; then
  echo "⚠️  Please set DB_PASS, ADMIN_EMAIL, ADMIN_USER, ADMIN_PASS at the top of this script."
  exit 1
fi

echo "========================================="
echo " Flarum Deployment: ${FLARUM_DOMAIN}"
echo "========================================="

# ─── 1. System Dependencies ─────────────────────────────────
echo "[1/8] Installing system dependencies..."
apt-get update -qq
apt-get install -y --no-install-recommends \
  mariadb-server mariadb-client \
  php8.3 php8.3-fpm php8.3-cli \
  php8.3-mbstring php8.3-xml php8.3-curl php8.3-zip \
  php8.3-gd php8.3-mysql php8.3-tokenizer php8.3-bcmath \
  php8.3-fileinfo php8.3-opcache \
  nginx unzip curl git

echo "✅ PHP 8.3 + MariaDB + extensions installed"

# Start MariaDB if not running
systemctl enable mariadb
systemctl start mariadb
echo "✅ MariaDB started"

# ─── 2. Composer ────────────────────────────────────────────
echo "[2/7] Installing Composer..."
if ! command -v composer &>/dev/null; then
  curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer
fi
echo "✅ Composer $(composer --version | head -1)"

# ─── 3. MySQL/MariaDB Database ──────────────────────────────
echo "[3/7] Setting up database..."
if command -v mysql &>/dev/null; then
  mysql -u root -e "CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
  mysql -u root -e "CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASS}';"
  mysql -u root -e "GRANT ALL PRIVILEGES ON \`${DB_NAME}\`.* TO '${DB_USER}'@'localhost';"
  mysql -u root -e "FLUSH PRIVILEGES;"
  echo "✅ Database ${DB_NAME} created"
else
  echo "⚠️  MySQL/MariaDB not found. Please create the database manually:"
  echo "    CREATE DATABASE \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
  echo "    CREATE USER '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASS}';"
  echo "    GRANT ALL ON \`${DB_NAME}\`.* TO '${DB_USER}'@'localhost';"
fi

# ─── 4. Flarum Installation ─────────────────────────────────
echo "[4/7] Installing Flarum to ${FLARUM_DIR}..."
mkdir -p "${FLARUM_DIR}"
cd "${FLARUM_DIR}"

if [[ ! -f "flarum/composer.json" && ! -f "composer.json" ]]; then
  composer create-project flarum/flarum . --no-interaction
  echo "✅ Flarum installed"
else
  echo "ℹ️  Flarum already exists in ${FLARUM_DIR}, skipping installation"
  echo "    Run 'composer update' manually if you want to update."
fi

# ─── 5. File Permissions ────────────────────────────────────
echo "[5/7] Setting file permissions..."
chown -R www-data:www-data "${FLARUM_DIR}"
chmod -R 755 "${FLARUM_DIR}"
# Flarum needs write access to these directories (may not exist yet)
[[ -d "${FLARUM_DIR}/storage" ]] && chmod -R 775 "${FLARUM_DIR}/storage"
[[ -d "${FLARUM_DIR}/assets" ]] && chmod -R 775 "${FLARUM_DIR}/assets"

echo "✅ Permissions set (www-data:www-data)"

# ─── 6. Nginx Virtual Host ──────────────────────────────────
echo "[6/7] Configuring Nginx for ${FLARUM_DOMAIN}..."

cat > /etc/nginx/sites-available/flarum <<NGINX_EOF
server {
    listen 80;
    server_name ${FLARUM_DOMAIN};

    root ${FLARUM_DIR}/public;
    index index.php;

    # Flarum-specific: block access to sensitive files
    location ~ /vendor/ { deny all; return 404; }
    location ~ /storage/ { deny all; return 404; }
    location ~ /\.git     { deny all; return 404; }
    location ~ /composer\.(json|lock) { deny all; return 404; }
    location ~ /flarum    { deny all; return 404; }
    location ~ /config\.php { deny all; return 404; }

    # Flarum routing: try files, then pass to index.php
    location / {
        try_files \$uri \$uri/ /index.php?\$query_string;
    }

    # API endpoints
    location /api {
        try_files \$uri \$uri/ /index.php?\$query_string;
    }

    # Admin panel
    location /admin {
        try_files \$uri \$uri/ /index.php?\$query_string;
    }

    # PHP-FPM pass
    location ~ \.php$ {
        fastcgi_split_path_info ^(.+\.php)(/.+)$;
        fastcgi_pass unix:/run/php/php8.3-fpm.sock;
        fastcgi_index index.php;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME \$document_root\$fastcgi_script_name;
        fastcgi_param PATH_INFO \$fastcgi_path_info;
        fastcgi_buffer_size 128k;
        fastcgi_buffers 4 256k;
    }

    # Static asset caching
    location ~* \.(jpg|jpeg|png|gif|ico|svg|webp|css|js|woff|woff2|ttf|eot)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options SAMEORIGIN always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy strict-origin-when-cross-origin always;
}
NGINX_EOF

# Enable the site
ln -sf /etc/nginx/sites-available/flarum /etc/nginx/sites-enabled/flarum
# Remove default site if it conflicts
rm -f /etc/nginx/sites-enabled/default

# Test and reload Nginx
nginx -t && systemctl reload nginx
echo "✅ Nginx configured and reloaded"

# ─── 7. PHP-FPM Configuration ───────────────────────────────
echo "[7/7] Tuning PHP-FPM..."

# Increase upload limits and memory
cat > /etc/php/8.3/fpm/conf.d/99-flarum.ini <<PHP_EOF
upload_max_filesize = 64M
post_max_size = 64M
memory_limit = 256M
max_execution_time = 120
max_input_time = 120
opcache.enable = 1
opcache.memory_consumption = 128
opcache.max_accelerated_files = 10000
opcache.revalidate_freq = 60
PHP_EOF

systemctl restart php8.3-fpm
echo "✅ PHP-FPM restarted with Flarum settings"

# ─── Summary ────────────────────────────────────────────────
echo ""
echo "========================================="
echo " ✅ Flarum deployment complete!"
echo "========================================="
echo ""
echo " Next steps:"
echo " 1. Point DNS: bbs.jueshi.net → ${VPS_IP}"
echo " 2. Install SSL (Let's Encrypt):"
echo "    apt-get install certbot python3-certbot-nginx"
echo "    certbot --nginx -d ${FLARUM_DOMAIN}"
echo " 3. Complete setup via web installer:"
echo "    https://${FLARUM_DOMAIN}"
echo "    - Database: ${DB_NAME} / ${DB_USER}"
echo "    - Admin: ${ADMIN_USER} / ${ADMIN_EMAIL}"
echo " 4. (Optional) Configure SSO with main site via Flarum FoF Passport extension:"
echo "    composer require fof/passport"
echo "    php flarum cache:clear"
echo ""
echo " Files:"
echo "  Install dir : ${FLARUM_DIR}"
echo "  Web root    : ${FLARUM_DIR}/public"
echo "  Nginx config: /etc/nginx/sites-available/flarum"
echo "  PHP config  : /etc/php/8.3/fpm/conf.d/99-flarum.ini"
echo ""
