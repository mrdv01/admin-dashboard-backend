// app.js
import express from 'express';
import dotenv from 'dotenv';
import dbConnect from '../config/dbConnect.js';
import adminRouter from '../routes/adminRouter.js';

import cors from 'cors';

dotenv.config();  // Load environment variables

const app = express();
app.use(express.json());
app.use(cors());


// Define a test route
app.get('/', (req, res) => {
    res.send('Node.js server with MySQL connection');
});

//conditional listen
dbConnect.query('SELECT 1').then(() => {
    console.log('dbconnected');
}).catch(error => {
    console.log(error);
})

// Route to get blogs from the database
app.use('/api/v1/admin', adminRouter);

export default app;
