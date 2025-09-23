module.exports = {
  apps: [
    {
      name: 'tattoo-site-frontend',
      script: 'npx',
      args: 'serve -s dist -l 3008',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3008
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3008
      },
      error_file: './logs/frontend-err.log',
      out_file: './logs/frontend-out.log',
      log_file: './logs/frontend-combined.log',
      time: true,
      log_date_format: 'YYYY-MM-DD HH:mm Z',
      merge_logs: true,
      // 进程管理配置
      min_uptime: '10s',
      max_restarts: 10,
      // 健康检查
      health_check_grace_period: 3008,
      health_check_fatal_exceptions: true,
      // 优雅关闭
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 3000
    }
  ],

  deploy: {
    production: {
      user: 'ubuntu',
      host: 'your-server-ip',
      ref: 'origin/main',
      repo: 'git@github.com:your-username/tattoo-site.git',
      path: '/var/www/tattoo-site',
      'pre-deploy-local': '',
      'post-deploy': 'cd frontend && npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
}