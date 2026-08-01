module.exports = {
  apps: [
    {
      name: 'smartfood-backend',
      script: 'server.js',
      cwd: 'server',
      env: {
        NODE_ENV: 'development'
      }
    },
    {
      name: 'smartfood-frontend',
      script: 'node_modules/vite/bin/vite.js',
      cwd: 'client',
      interpreter: 'node'
    },
    {
      name: 'smartfood-tunnel',
      script: 'tunnel.js',
      cwd: '.'
    }
  ]
};
