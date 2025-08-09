// Server entry point - refactored to use new structure
const GameServer = require('./src/app');

// Create and start the server
const server = new GameServer();
server.start();