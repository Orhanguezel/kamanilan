const path = require("path");

const appRoot = process.env.BACKEND_CWD || __dirname;
const bindHost = process.env.BACKEND_HOST || "127.0.0.1";
const port = process.env.BACKEND_PORT || "8085";
const appName = process.env.BACKEND_APP_NAME || "kamanilan-backend";

module.exports = {
  apps: [
    {
      name: appName,
      cwd: path.resolve(appRoot),
      interpreter: "none",
      script: "node",
      args: "--experimental-specifier-resolution=node dist/index.js",

      exec_mode: "fork",
      instances: 1,
      watch: false,
      autorestart: true,
      max_memory_restart: "300M",

      // Kritik: crash loop kontrolü
      min_uptime: "20s",
      max_restarts: 10,
      restart_delay: 3000,

      // CPU’yu yakan log spam’i azaltır (opsiyonel)
      // log_date_format: "YYYY-MM-DD HH:mm:ss.SSS Z",

      env: {
        NODE_ENV: "production",
        HOST: bindHost,
        PORT: String(port),
      },

      out_file:
        process.env.BACKEND_OUT_LOG || `/home/orhan/.pm2/logs/${appName}.out.log`,
      error_file:
        process.env.BACKEND_ERR_LOG || `/home/orhan/.pm2/logs/${appName}.err.log`,
      combine_logs: true,
      time: true,
    },
  ],
};
