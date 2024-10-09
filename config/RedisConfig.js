import redis from 'redis';
import dotenv from 'dotenv';
dotenv.config();
const client = redis.createClient({
    url: process.env.REDIS_URL, // Use the URL provided by your cloud Redis service
    socket: {
     
        rejectUnauthorized: false // Set to true if you have a valid certificate
    }
});

client.on('connect', () => {
    console.log('Connected to Redis');
});

client.on('error', (err) => {
    console.log('Error connecting to Redis', err);
});



export default client;