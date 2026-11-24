const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('./app');
const { seed } = require('./seed');

const PORT = process.env.PORT || 3000;

(async () => {
  const mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri(), { dbName: 'holerites' });
  await seed();
  const server = app.listen(PORT, () => {
    console.log(`Aplicação:  http://localhost:${PORT}`);
    console.log(`Swagger UI: http://localhost:${PORT}/api-docs`);
    console.log(`YAML:       http://localhost:${PORT}/api-docs.yaml`);
  });
  const stop = async () => { server.close(); await mongoose.disconnect(); await mongod.stop(); process.exit(0); };
  process.on('SIGINT', stop); process.on('SIGTERM', stop);
})().catch((e) => { console.error(e); process.exit(1); });
