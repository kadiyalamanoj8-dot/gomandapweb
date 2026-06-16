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
    }
  ]
};
