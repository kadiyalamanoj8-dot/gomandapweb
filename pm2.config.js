module.exports = {
  apps: [
    {
      name: 'gomandap-backend',
      script: './backend/server.js',
      cwd: './',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
        AWS_SUPPRESS_NODE_VERSION_WARNING: '1',
        NODE_NO_WARNINGS: '1'
      }
    },
    {
      name: 'gomandap-client',
      script: 'serve',
      env: {
        PM2_SERVE_PATH: './client/dist',
        PM2_SERVE_PORT: 3000,
        PM2_SERVE_SPA: 'true',
        PM2_SERVE_HOMEPAGE: '/index.html'
      }
    },
    {
      name: 'gomandap-vendor',
      script: 'serve',
      env: {
        PM2_SERVE_PATH: './vendor/dist',
        PM2_SERVE_PORT: 3001,
        PM2_SERVE_SPA: 'true',
        PM2_SERVE_HOMEPAGE: '/index.html'
      }
    },
    {
      name: 'gomandap-admin',
      script: 'serve',
      env: {
        PM2_SERVE_PATH: './admin/dist',
        PM2_SERVE_PORT: 3002,
        PM2_SERVE_SPA: 'true',
        PM2_SERVE_HOMEPAGE: '/index.html'
      }
    }
  ]
};
