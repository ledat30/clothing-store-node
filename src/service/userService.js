import db from "../models/index.js";
import bcrypt from "bcryptjs";

const createUser = async ({ username, email, password,phonenumber, role , provinceId, districtId,wardId ,isDelete}) => {
    try {
        const existingUser = await db.User.findOne({ where: { email } });
        if (existingUser) {
            return {
                EM: "Email already in use.",
                EC: "-1",
                DT: "",
            };
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await db.User.create({
            phonenumber,
            username,
            email,
            role,
            provinceId,
            districtId,
            wardId,
            isDelete: 'false',
            password: hashedPassword,
        });

        return {
            EM: "User created successfully!",
            EC: "0",
            DT: newUser,
        };
    } catch (error) {
        return {
            EM: "Error creating user: " + error.message,
            EC: "-1",
            DT: "",
        };
    }
};


export default { createUser};