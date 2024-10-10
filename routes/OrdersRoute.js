import {  Router } from "express";
import Order from "../models/OrderModel.js";
import { verifyToken } from "../utils/verifyTokenUtil.js";
import redisClient from "../config/RedisConfig.js";
const router = Router();



router.post("/orders", verifyToken, async (req, res) => {
    try {
        const { items } = req.body;
        const order = new Order({ customerEmail: req.user.email, items, status: "Pending" });
        await order.save();
        res.status(201).send(order);
    } catch (error) {
        res.status(400).send(error);
    }
});

router.put("/orders/:id/status", async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
        if (!order) {
            return res.status(404).send();
        }
        await redisClient.set(req.params.id, JSON.stringify(order), {
            EX: 3600 // Cache for 1 hour
        });
        res.send(order);
    } catch (error) {
        res.status(400).send(error);
    }
});

router.get("/orders/:id", async (req, res) => {
    const orderId = req.params.id;
    console.log(orderId);
    // Check if order is in cache
    const cachedata = await redisClient.get(orderId);

    if (cachedata) {
        console.log("Fetching from cache", cachedata);
        res.send(JSON.parse(cachedata));
        return;
    } else {
        try {
            const order = await Order.findById(orderId);
            if (!order) {
                return res.status(404).send();
            }
            console.log("Fetching from MongoDB", JSON.stringify(order));
            await redisClient.set(orderId, JSON.stringify(order), {
                EX: 3600 // Cache for 1 hour
            });
            res.send(order);
        } catch (error) {
            res.status(400).send(error);
        }
    }

});

router.delete("/orders/:id", async (req, res) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);
        if (!order) {
            return res.status(404).send();
        }
        res.send(order);
    } catch (error) {
        res.status(400).send(error);
    }
});


export default router;