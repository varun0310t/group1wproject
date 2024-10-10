import express from "express";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import cluster from "cluster";
import os from "os";
import client from "./config/RedisConfig.js";
import MongooseConfig from "./config/MongooseConfig.js";
import UserRoute from "./routes/UserRoute.js";
import OrdersRoute from "./routes/OrdersRoute.js";
import MenuRoute from "./routes/MenuRoute.js";

const isClusterEnabled = true;
dotenv.config();

cluster.schedulingPolicy = cluster.SCHED_RR;

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100000000// limit each IP to 100 requests per windowMs
});



if (cluster.isMaster && isClusterEnabled) {

    const cpus = os.cpus().length;
    console.log(`Clustering to ${cpus} CPUs`);
    for (let i = 0; i < cpus; i++) {
        cluster.fork();
    }
    cluster.on("exit", (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died`);
        cluster.fork();
    });
}
else {
    const app = express();
    app.use(limiter);
    app.use(express.json());
    app.use(UserRoute);
    app.use(OrdersRoute);
    app.use(MenuRoute);

    MongooseConfig();
    client.connect();
    app.get("/", (req, res) => {

        console.log("Request received by worker", cluster?.worker?.id);
        res.send("Hello World!, I am worker " + cluster?.worker?.id + "PID:" + process.pid);
    });

    app.listen(3000, () => {
        console.log("Server is running on port 3000 and worker is", cluster?.worker?.id, "PID:", process.pid);
    });
}

