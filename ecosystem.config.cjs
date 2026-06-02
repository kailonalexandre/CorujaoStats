module.exports = {
  apps: [
    {
      name: "sorteador-times",
      script: "npm",
      args: "run start",
      cwd: __dirname,
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: "3000",
      },
      max_memory_restart: "512M",
      time: true,
    },
  ],
};
