import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import proprietorRoutes from './routes/proprietor.js';
import itemRoutes from './routes/item.js';
import managerRoutes from './routes/manager.js';
import workerRoutes from './routes/worker.js';
import mongoCache from './cache/mongocache.js';


const app = express();

app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));


app.use(cors(
    {
        origin: ["http://localhost:4000", "http://localhost:3000", "https://manufacturing-manager.netlify.app", "https://manufacturing-proprietor.netlify.app"],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true
    }
))

app.use('/proprietor', proprietorRoutes);
app.use('/item', itemRoutes);
app.use('/manager', managerRoutes);
app.use('/worker', workerRoutes);

// // Define the originalConsoleLog function
// const originalConsoleLog = console.log;

// // Override console.log to prepend timestamps
// console.log = function () {
//     const timestamp = new Date().toISOString();
//     const updatedArguments = Array.from(arguments).map(arg => {
//         if (typeof arg === 'string' || arg instanceof String)
//             return `[${timestamp}]: ${arg}`;
//         else
//             return `[${timestamp}]: ${JSON.stringify(arg)}`
//     });
//     originalConsoleLog.apply(console, updatedArguments);
// };

const CONNECTION_URL = process.env.MONGODB_URL
const PORT = process.env.PORT || 5000;

mongoose.connect(CONNECTION_URL)
    .then(() => app.listen(PORT, () => {
        console.log(`Server running on port: ${PORT}`);
        mongoCache.initialize()
            .then(() => console.log('MongoCache initialized'))
            .catch((error) => console.log('MongoCache initialization error:', error.message));


    }))
    .catch((error) => console.log(error.message))

