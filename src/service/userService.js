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

const getAllUsers = async (limit, page, search) => {
    try {
        const offset = (page - 1) * limit;
        const whereClause = {isDelete: "false"};

        if (search) {
            whereClause.username = {
                [db.Sequelize.Op.like]: `%${search}%`,
            };
        }

        const { count: totalCount, rows: users } = await db.User.findAndCountAll({
            where: whereClause,
            limit: Number(limit),
            offset: Number(offset),
            order: [['createdAt', 'DESC']],
        });

        return {
            EM: "Get all users successfully!",
            EC: "0",
            DT: users,
            totalCount,
        };
    } catch (error) {
        return {
            EM: "Error Get all users: " + error.message,
            EC: "-1",
            DT: "",
        };
    }
};

const updateUser = async (id, userData) => {
    try {
        const [updatedRowsCount, updatedRows] = await db.User.update(userData, {
            where: { id },
            returning: true,
        });

        if (updatedRowsCount === 0) {
            return {
                EM: "User not found!",
                EC: "-1",
                DT: "",
            };
        }

        const updatedUser = await db.User.findByPk(id);

        return {
            EM: "User updated successfully!",
            EC: "0",
            DT: updatedUser,
        };
    } catch (error) {
        return {
            EM: "Error updating user: " + error.message,
            EC: "-1",
            DT: "",
        };
    }
};

const deleteUser = async (id) => {
    
    try {
        const user = await db.User.findByPk(id);

        if (!user) {
            return {
                EM: "User not found!",
                EC: "-1",
                DT: "",
            };
        }

        user.isDelete = true;
        await user.save();

        return {
            EM: "User deleted successfully!",
            EC: "0",
            DT: user,
        };
    } catch (error) {
        return {
            EM: "Error deleting user: " + error.message,
            EC: "-1",
            DT: "",
        };
    }
};


export default { createUser, getAllUsers, updateUser, deleteUser };