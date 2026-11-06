'use strict';

const app = require('./app');
const { initializeDatabase, pool } = require('./db');

const PORT = Number(process.env.PORT) || 5000;

async function startServer() {
  await initializeDatabase();
  const server = app.listen(PORT, () => {
    console.log(`API ready at http://localhost:${PORT}`);
    console.log('Database: Supabase Postgres');
  });

  const shutdown = () => {
    server.close(async () => {
      await pool.end();
      process.exit(0);
    });
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

startServer().catch((error) => {
  console.error('Failed to initialize Supabase database:', error);
  pool.end().finally(() => {
    process.exitCode = 1;
  });
});
