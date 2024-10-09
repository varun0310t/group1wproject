import { Router } from "express";
import Menu from "../models/MenuModel.js";
import redisClient from "../config/RedisConfig.js";
const router = Router();

router.post("/menu", async (req, res) => {
    try {
        const menuItem = new Menu(req.body);
        await menuItem.save();

        const menuItems = await Menu.find();
        await redisClient.set("menu", JSON.stringify(menuItems), {
            EX: 3600 // Cache for 1 hour
        });

        res.status(201).send(menuItem);
    } catch (error) {
        console.error(error);
        res.status(400).send(error);
    }
});

router.put("/menu/:id", async (req, res) => {
    try {
        const menuItem = await Menu.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!menuItem) {
            return res.status(404).send();
        }
        const menuItems = await Menu.find();
        await redisClient.set("menu", JSON.stringify(menuItems), {
            EX: 3600 // Cache for 1 hour
        });
        res.send(menuItem);
    } catch (error) {
        console.error(error);
        res.status(400).send(error);
    }
});

router.get("/menu", async (req, res) => {
    try {
        const cachedMenu = await redisClient.get("menu");
        if (cachedMenu) {
            console.log("Fetching from cache");
            return res.send(JSON.parse(cachedMenu));
        } else {
            const menuItems = await Menu.find();
            await redisClient.set("menu", JSON.stringify(menuItems), {
                EX: 3600 // Cache for 1 hour
            });
            res.send(menuItems);
        }
    } catch (error) {
        console.error(error);
        res.status(400).send(error);
    }
});

router.delete("/menu/:id", async (req, res) => {
    try {
        const menuItem = await Menu.findByIdAndDelete(req.params.id);
        if (!menuItem) {
            return res.status(404).send();
        }
        const menuItems = await Menu.find();
        redisClient.setex("menu", 3600, JSON.stringify(menuItems));

        res.send(menuItem);
    } catch (error) {
        res.status(400).send(error);
    }
});

export default router;