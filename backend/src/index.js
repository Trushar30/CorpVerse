const config = require('./config');
const connectDB = require('./config/db');
const createApp = require('./app');

const startServer = async () => {
  try {
    // Connect to MongoDB Atlas
    await connectDB();

    // Create Express app
    const app = createApp();

    // Start listening
    app.listen(config.port, () => {
      console.log(`
╔══════════════════════════════════════════════════╗
║                                                  ║
║   🌐 CorpVerse API Server                        ║
║                                                  ║
║   Environment : ${config.nodeEnv.padEnd(15)}            ║
║   Port        : ${String(config.port).padEnd(15)}            ║
║   Client URL  : ${config.clientUrl.padEnd(15)}  ║
║                                                  ║
║   API Health  : http://localhost:${config.port}/api/health  ║
║                                                  ║
╚══════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err.message);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err.message);
  process.exit(1);
});

startServer();
