import { Router } from "express";
import User from "../models/UserModel.js";
import jwt from 'jsonwebtoken';
const router = Router();


router.post("/users/register", async (req, res) => {
    try {

        const { username, password, email } = req.body;

        const user = new User({ username, password, email });

        await user.save();

        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);

        res.status(201).send({ user, token });
    } catch (error) {
        res.status(400).send(error);
    }
});

router.post("/users/login", async (req, res) => {
    try {
        const user = await User.find({ email: req.body.email, password: req.body.password });
        if (!user) {
            return res.status(401).send({ error: "Login failed! Check authentication credentials" });
        }
        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
        res.send({ user, token });
    } catch (error) {
        res.status(400).send(error);
    }
});


export default router;