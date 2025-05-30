import userService from "../service/userService.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../models/index.js";

const createUser = async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      phonenumber,
      role,
      provinceId,
      districtId,
      wardId,
      isDelete,
    } = req.body;

    if (!password || !email || !role) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const data = await userService.createUser({
      username,
      email,
      password,
      phonenumber,
      role,
      provinceId,
      districtId,
      wardId,
      isDelete,
    });
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

const getAllUsers = async (req, res) => {
  try {
    const { limit = 10, page = 1, search = "" } = req.query;
    const data = await userService.getAllUsers(limit, page, search);
    const totalPages = Math.ceil(data.totalCount / limit);
    res.status(200).json({
      EM: data.EM,
      EC: data.EC,
      DT: data.DT,
      total: data.totalCount,
      page: Number(page),
      limit: Number(limit),
      totalPages,
    });
  } catch (error) {
    res.status(500).json({
      EM: "Get all user error" + error.message,
      EC: "-1",
      DT: "",
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    const user = await db.User.findOne({
      where: { email },
      include: [
        { model: db.Province, attributes: ["province_name"] },
        { model: db.District, attributes: ["district_name"] },
        { model: db.Ward, attributes: ["ward_name"] },
      ],
    });

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

    const userInfo = {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    };

    if (user.role === "customer") {
      userInfo.provinceId = user.provinceId;
      userInfo.districtId = user.districtId;
      userInfo.wardId = user.wardId;
      userInfo.phonenumber = user.phonenumber;
      userInfo.wardName = user.Ward?.ward_name || null;
      userInfo.districtName = user.District?.district_name || null;
      userInfo.provinceName = user.Province?.province_name || null;
    }

    const token = jwt.sign(userInfo,"my_hardcoded_secret", {
      expiresIn: process.env.JWT_EXPIRES_IN || "1d",
    });

    return res.status(200).json({
      EM: "Login successful.",
      EC: 0,
      DT: {
        token,
        user: userInfo,
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

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userData = req.body;

    const data = await userService.updateUser(id, userData);

    if (data.EC === "0") {
      res.status(200).json({
        EM: data.EM,
        EC: data.EC,
        DT: data.DT,
      });
    } else {
      res.status(400).json({
        EM: data.EM,
        EC: data.EC,
        DT: data.DT,
      });
    }
  } catch (error) {
    res.status(500).json({
      EM: "Update user error: " + error.message,
      EC: "-1",
      DT: "",
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await userService.deleteUser(id);

    if (data.EC === "0") {
      res.status(200).json({
        EM: data.EM,
        EC: data.EC,
        DT: data.DT,
      });
    } else {
      res.status(400).json({
        EM: data.EM,
        EC: data.EC,
        DT: data.DT,
      });
    }
  } catch (error) {
    res.status(500).json({
      EM: "Delete user error: " + error.message,
      EC: "-1",
      DT: "",
    });
  }
};

const logOut = async (req, res) => {
  try {
    return res.status(200).json({
      EM: "Logout successful.",
      EC: 0,
      DT: "",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      EM: "Logout failed. " + error.message,
      EC: -1,
      DT: "",
    });
  }
};

const getAllProvinceDistrictWard = async (req, res) => {
  try {
    let data = await userService.getAllProvinceDistrictWard();

    return res.status(200).json({
      EM: data.EM,
      EC: data.EC,
      DT: data.DT,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      EM: "Error",
      EC: "-1",
      DT: "",
    });
  }
};

const register = async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      phonenumber,
      wardId,
      districtId,
      provinceId,
    } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const data = await userService.register({
      username,
      email,
      password,
      phonenumber,
      wardId,
      districtId,
      provinceId,
    });
    res.status(201).json({
      EM: data.EM,
      EC: data.EC,
      DT: data.DT,
    });
  } catch (error) {
    res.status(500).json({
      EM: "Register user error" + error.message,
      EC: "-1",
      DT: "",
    });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { email, otpCode } = req.body;

    if (!email || !otpCode) {
      return res.status(400).json({
        EM: "Email and OTP are required.",
        EC: "-1",
        DT: "",
      });
    }

    const data = await userService.verifyEmail({ email, otpCode });
    res.status(200).json({
      EM: data.EM,
      EC: data.EC,
      DT: data.DT,
    });
  } catch (error) {
    res.status(500).json({
      EM: "Verify email error: " + error.message,
      EC: "-1",
      DT: "",
    });
  }
};

const searchHomePage = async (req, res) => {
  try {
    const keyword = req.query.q;
    const data = await userService.searchHomePage(keyword);
    return res.status(200).json({
      EM: data.EM,
      EC: data.EC,
      DT: data.DT,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      EM: "Error",
      EC: "-1",
      DT: "",
    });
  }
};

export default {
  login,
  createUser,
  getAllUsers,
  updateUser,
  deleteUser,
  logOut,
  register,
  verifyEmail,
  getAllProvinceDistrictWard,
  searchHomePage,
};
