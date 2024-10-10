import axios from 'axios';
import cluster from 'cluster';
import os from 'os';

const url = 'http://localhost:3000';
const interval = 100; // 1 second
const requestsPerInterval = 500;
const numCPUs = os.cpus().length;

const makeRequests = async () => {
    for (let i = 0; i < requestsPerInterval; i++) {
        try {
            const response = await axios.get(url);
            console.log(`Response from worker ${cluster.worker.id}, request ${i + 1}:`, response.data);
        } catch (error) {
            console.error(`Error from worker ${cluster.worker.id}, request ${i + 1}:`, error.message);
        }
    }
};

if (cluster.isMaster) {
    console.log(`Master ${process.pid} is running`);
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }
    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died`);
        cluster.fork();
    });
} else {
    console.log(`Worker ${process.pid} started`);
    setInterval(makeRequests, interval);
}