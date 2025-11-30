module.exports = {
  apps: [
    {
      name: 'ivea-order-tracking',
      script: 'dist/index.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      time: true,
      max_memory_restart: '500M',
      node_args: '--max-old-space-size=512',
      watch: false,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 4000,
      kill_timeout: 5000
    }
  ]
};
