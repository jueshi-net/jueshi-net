#!/bin/bash
# Load production environment variables from .env.production
set -a
[ -f /home/deploy/xixiong-saas/.env.production ] && . /home/deploy/xixiong-saas/.env.production
set +a
exec npm start
