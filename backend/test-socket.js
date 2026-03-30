const io = require('socket.io-client');

const socket = io('http://localhost:3000');

socket.on('connect', () => {
  console.log('Connected to Socket.io');
  console.log(`Socket ID: ${socket.id}`);

  // Send a test message
  console.log('\nSending test message...');
  socket.emit('userMessage', {
    conversationId: '67421e4b8a1c3d2e4f5a6b7c', // Replace with real conversation ID
    text: 'Hello! This is a Socket.io test message.',
    userId: '507f1f77bcf86cd799439011',
  });
});

socket.on('messageReceived', (data) => {
  console.log('\nMessage received confirmation:');
  console.log(`   Conversation: ${data.conversationId}`);
  console.log(`   Text: ${data.text}`);
  console.log(`   Timestamp: ${data.timestamp}`);
});

socket.on('botMessage', (data) => {
  console.log('\nBot response received:');
  console.log(`   Text: ${data.text}`);
  console.log(`   Timestamp: ${data.timestamp}`);

  console.log('\nSocket.io test successful!');
  socket.disconnect();
  process.exit(0);
});

socket.on('error', (error) => {
  console.error('\nError:', error);
  socket.disconnect();
  process.exit(1);
});

socket.on('disconnect', () => {
  console.log('\nDisconnected from Socket.io');
});

setTimeout(() => {
  console.log('\nTimeout - no response received in 10 seconds');
  socket.disconnect();
  process.exit(1);
}, 10000);
