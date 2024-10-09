import { Router } from "express";
import Order from "../models/OrderModel.js";
import { verifyToken } from "../utils/verifyTokenUtil.js";
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
        redisClient.get(req.params.id, async (err, cachedOrder) => {
            if (err) throw err;

            if (cachedOrder) {
                // If order is found in cache, return it
                redisClient.setex(req.params.id, 3600, JSON.stringify(order));
            }
        });
        res.send(order);
    } catch (error) {
        res.status(400).send(error);
    }
});

router.get("/orders/:id", async (req, res) => {
    const orderId = req.params.id;

    // Check if order is in cache
    redisClient.get(orderId, async (err, cachedOrder) => {
        if (err) throw err;

        if (cachedOrder) {
            // If order is found in cache, return it
            return res.send(JSON.parse(cachedOrder));
        } else {
            try {
                // If order is not in cache, fetch from database
                const order = await Order.findById(orderId);
                if (!order) {
                    return res.status(404).send();
                }

                // Store order in cache and return it
                redisClient.setex(orderId, 3600, JSON.stringify(order)); // Cache for 1 hour
                res.send(order);
            } catch (error) {
                res.status(400).send(error);
            }
        }
    });
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