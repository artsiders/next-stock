// /var/www/next-stock/ecosystem.config.js
module.exports = {
  apps: [
    {
      name: "nest-stock",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3009",
      cwd: "/var/www/nest-stock",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
