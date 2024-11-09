import http from 'http';
import app from './app/app.js';

const PORT = process.env.PORT || 5000;

// Create an HTTP server using the Express app
const server = http.createServer(app);

// Start the server
server.listen(PORT, () => {
    console.log(`Server is up and running on port ${PORT}`);
});
