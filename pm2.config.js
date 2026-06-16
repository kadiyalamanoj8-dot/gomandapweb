const HOME = '/home/opc/gomandapweb';

module.exports = {
  apps: [
    {
      name: 'gomandap-backend',
      script: `${HOME}/backend/server.js`,
      cwd: HOME,
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
      cwd: HOME,
      env: {
        PM2_SERVE_PATH: `${HOME}/client/dist`,
        PM2_SERVE_PORT: 3000,
        PM2_SERVE_SPA: 'true',
        PM2_SERVE_HOMEPAGE: '/index.html'
      }
    },
    {
      name: 'gomandap-vendor',
      script: 'serve',
      cwd: HOME,
      env: {
        PM2_SERVE_PATH: `${HOME}/vendor/dist`,
        PM2_SERVE_PORT: 3001,
        PM2_SERVE_SPA: 'true',
        PM2_SERVE_HOMEPAGE: '/index.html'
      }
    },
    {
      name: 'gomandap-admin',
      script: 'serve',
      cwd: HOME,
      env: {
        PM2_SERVE_PATH: `${HOME}/admin/dist`,
        PM2_SERVE_PORT: 3002,
        PM2_SERVE_SPA: 'true',
        PM2_SERVE_HOMEPAGE: '/index.html'
      }
    }
  ]
};
