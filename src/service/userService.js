import db from "../models/index.js";
import bcrypt from "bcryptjs";
import emailService from "./emailService.js";

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

        user.isDelete = "true";
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

const register = async ({ username, email, password }) => {
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

        const otpCode = Math.floor(1000 + Math.random() * 9000);
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); 

        
        const newUser = await db.User.create({
            username,
            email,
            password: hashedPassword,
            role: "customer",
            otpCode,
            otpExpiry,
            isVerified: false,
        });

        const subject = "Xác nhận email";
        const text = `Xin chào ${newUser.username}, mã xác nhận của bạn là ${otpCode}. Mã này sẽ hết hạn sau 10 phút.`;
        await emailService.sendEmail(email, subject, text);

        return {
            EM: "User created successfully! OTP sent to email.",
            EC: "0",
            DT: "",
        };
    } catch (error) {
        return {
            EM: "Error creating user: " + error.message,
            EC: "-1",
            DT: "",
        };
    }
};

const verifyEmail = async ({ email, otpCode }) => {
    try {
        // Tìm người dùng theo email
        const user = await db.User.findOne({ where: { email } });

        if (!user) {
            return {
                EM: "User not found.",
                EC: "-1",
                DT: "",
            };
        }

        // Kiểm tra xem đã xác minh chưa
        if (user.isVerified) {
            return {
                EM: "User already verified.",
                EC: "0",
                DT: "",
            };
        }

        // Kiểm tra OTP và thời gian hết hạn
        if (user.otpCode !== otpCode || user.otpExpiry < new Date()) {
            return {
                EM: "Invalid or expired OTP.",
                EC: "-1",
                DT: "",
            };
        }

        // Cập nhật trạng thái xác minh
        await user.update({
            isVerified: true,
            otpCode: null,
            otpExpiry: null,
        });

        return {
            EM: "Email verified successfully!",
            EC: "0",
            DT: "",
        };
    } catch (error) {
        return {
            EM: "Error verifying email: " + error.message,
            EC: "-1",
            DT: "",
        };
    }
};

export default { createUser, getAllUsers, updateUser, deleteUser , register, verifyEmail};