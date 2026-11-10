/**
 * Development convenience: starts an in-memory MongoDB instance and then
 * boots the API, so the project can run without installing MongoDB locally.
 *
 * Usage: npm run dev:memory
 */
import { MongoMemoryServer } from 'mongodb-memory-server';

const start = async () => {
  const mongod = await MongoMemoryServer.create({
    instance: { launchTimeout: 120000 },
  });

  process.env.MONGO_URI = mongod.getUri('realtime-chat');

  console.log('In-memory MongoDB started (data resets when the process stops).');
  console.log(`MONGO_URI=${process.env.MONGO_URI}`);

  await import('../src/server.js');

  const shutdown = async () => {
    await mongod.stop();
    process.exit(0);
  };

  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);
};

start().catch((error) => {
  console.error('Could not start the in-memory MongoDB:', error);
  process.exitCode = 1;
});
