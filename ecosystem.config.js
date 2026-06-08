/**
 * PM2 Ecosystem Configuration for JueShi.net
 * 
 * Usage on VPS:
 *   NODE_ENV=production pm2 start ecosystem.config.js
 *   pm2 save
 * 
 * Processes:
 *   1. xixiong-saas  — Next.js SSR main site
 *   2. jueshi-miner  — AI data miner daemon (24/7 crawler)
 */

module.exports = {
  apps: [
    {
      name: "xixiong-saas",
      cwd: "/home/deploy/xixiong-saas",
      instances: 1,
      exec_mode: "fork",
      // SECURITY: No secrets in this file.
      // AUTH_SECRET, AUTH_URL, NEXTAUTH_URL, DATABASE_URL are loaded from .env.production
      // by the wrapper script (scripts/pm2-start.sh).
      // Keys NOT in this env block are inherited from the shell environment.
      script: "/home/deploy/xixiong-saas/scripts/pm2-start.sh",
      interpreter: "none",
      env: {
        NODE_ENV: "production",
        PORT: "3000",
      },
      max_memory_restart: "1G",
      error_file: "/home/deploy/.pm2/logs/xixiong-saas-error.log",
      out_file: "/home/deploy/.pm2/logs/xixiong-saas-out.log",
      merge_logs: true,
      restart_delay: 5000,
    },
    {
      name: "jueshi-miner",
      script: "npx",
      args: "tsx scripts/advanced-crawler/daemon.ts",
      cwd: "/home/deploy/xixiong-saas",
      instances: 1,
      exec_mode: "fork",
      env_production: {
        NODE_ENV: "production",
      },
      max_memory_restart: "512M",
      error_file: "/home/deploy/.pm2/logs/jueshi-miner-error.log",
      out_file: "/home/deploy/.pm2/logs/jueshi-miner-out.log",
      merge_logs: true,
      restart_delay: 10000,
      // 矿机被 kill 后不自动重启（由主理人手动控制）
      // 如需 24/7 自动重启，取消下面这行注释：
      // autorestart: true,
    },
  ],
};
