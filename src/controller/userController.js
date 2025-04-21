import userService from "../service/userService.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../models/index.js";

const createUser = async (req, res) => {
    try {
        const { username, email, password,phonenumber, role, provinceId, districtId, wardId,isDelete } = req.body;

        if (!password || !email || !role) {
            return res.status(400).json({ message: "All fields are required." });
        }

        const data = await userService.createUser({ username, email, password,phonenumber, role , provinceId, districtId,wardId, isDelete});
        res.status(201).json({
            EM: data.EM,
            EC: data.EC,
            DT: data.DT,
        });
    } catch (error) {
        res.status(500).json({
            EM: "Create user error" + error.message,
            EC: "-1",
            DT: "",
        });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required." });
        }

        const user = await db.User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({
                EM: "User not found.",
                EC: 1,
                DT: "",
            });
        }

        const isMatch = bcrypt.compareSync(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                EM: "Incorrect password.",
                EC: 1,
                DT: "",
            });
        }

        const payload = { id: user._id, email: user.email, role: user.role };
        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN || "1d",
        });

        return res.status(200).json({
            EM: "Login successful.",
            EC: 0,
            DT: {
                token,
                user: {
                    id: user._id,
                    email: user.email,
                    username: user.username,
                    role: user.role,
                },
            },
        });
    } catch (error) {
        console.error(`error`, error);
        res.status(500).json({
            EM: "Login failed. " + error.message,
            EC: -1,
            DT: "",
        });
    }
};

export default { login , createUser};