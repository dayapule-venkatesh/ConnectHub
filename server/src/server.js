import http from 'node:http';
import { Server } from 'socket.io';

import app from './app.js';
import env from './config/env.js';
import connectDB from './config/db.js';
import initSocket from './sockets/index.js';

const startServer = async () => {
  await connectDB();

  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: env.clientUrls,
      credentials: true,
    },
  });

  app.set('io', io);
  initSocket(io);

  server.listen(env.port, () => {
    console.log(`API and Socket.IO listening on http://localhost:${env.port}`);
  });

  const shutdown = (signal) => {
    console.log(`\n${signal} received, shutting down gracefully...`);
    io.close();
    server.close(() => process.exit(0));
  };

  process.once('SIGINT', () => shutdown('SIGINT'));
  process.once('SIGTERM', () => shutdown('SIGTERM'));

  return { server, io };
};

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exitCode = 1;
});

export { startServer };
