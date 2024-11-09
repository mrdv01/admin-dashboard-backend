// app.js
import express from 'express';
import dotenv from 'dotenv';
import dbConnect from '../config/dbConnect.js';
import adminRouter from '../routes/adminRouter.js';

import cors from 'cors';
import supabase from '../config/dbConnect.js';

dotenv.config();  // Load environment variables

const app = express();
app.use(express.json());
app.use(cors());


// Define a test route
app.get('/', (req, res) => {
    res.send('Node.js server with MySQL connection');
});

async function checkConnection() {
    try {
        const { data, error } = await supabase
            .from('blogs')  // Replace with any table you have in your Supabase schema
            .select('*')              // A simple query to check if the table is accessible

        if (error) {
            throw error;
        }

        console.log('db connected');
    } catch (error) {
        console.log('Error connecting to db:', error.message);
    }
}

checkConnection();


// Route to get blogs from the database
app.use('/api/v1/admin', adminRouter);

export default app;
