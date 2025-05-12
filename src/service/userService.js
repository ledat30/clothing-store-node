import db from "../models/index.js";
import bcrypt from "bcryptjs";
import emailService from "./emailService.js";

const createUser = async ({
  username,
  email,
  password,
  phonenumber,
  role,
  provinceId,
  districtId,
  wardId,
  isDelete,
}) => {
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
      isDelete: "false",
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
    const whereClause = { isDelete: "false" };

    if (search) {
      whereClause.username = {
        [db.Sequelize.Op.like]: `%${search}%`,
      };
    }

    const { count: totalCount, rows: users } = await db.User.findAndCountAll({
      where: whereClause,
      limit: Number(limit),
      offset: Number(offset),
      order: [["createdAt", "DESC"]],
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

const getAllProvinceDistrictWard = async () => {
  try {
    try {
      let results = await db.Province.findAll({
        attributes: ["id", "province_full_name", "province_name"],
        include: [
          {
            model: db.District,
            attributes: [
              "id",
              "district_full_name",
              "district_name",
              "provinceId",
            ],
            include: [
              {
                model: db.Ward,
                attributes: ["id", "ward_name", "ward_full_name", "districtId"],
              },
            ],
          },
        ],
      });
      return {
        EM: "Get all success!",
        EC: 0,
        DT: results,
      };
    } catch (error) {
      console.log(error);
      return {
        EM: "Somnething wrongs with services",
        EC: -1,
        DT: [],
      };
    }
  } catch (error) {
    console.log(error);
    return {
      EM: "Somnething wrongs with services",
      EC: -1,
      DT: [],
    };
  }
};

const register = async ({
  username,
  email,
  password,
  phonenumber,
  wardId,
  districtId,
  provinceId,
}) => {
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
      phonenumber,
      provinceId,
      wardId,
      districtId,
      otpCode,
      otpExpiry,
      isVerified: false,
      isDelete: "false",
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
    if (
      String(user.otpCode) !== String(otpCode) ||
      new Date(user.otpExpiry) < new Date()
    ) {
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

const searchHomePage = async (keyword) => {
  try {
    const productResults = await db.Product.findAll({
      where: {
        isDelete: "false",
        [db.Sequelize.Op.or]: [
          {
            name: {
              [db.Sequelize.Op.like]: `%${keyword}%`,
            },
          },
        ],
      },
      attributes: ["name", "image", "id"],
    });

    const formattedProducts = productResults.map((product) => {
      const productData = product.toJSON();

      let image = productData.image;
      if (image && image.type === "Buffer" && Array.isArray(image.data)) {
        const buffer = Buffer.from(image.data);
        const imageString = buffer.toString("utf8");
        image = imageString.startsWith("data:image")
          ? imageString
          : `data:image/png;base64,${buffer.toString("base64")}`;
      } else if (image && Buffer.isBuffer(image)) {
        const imageString = image.toString("utf8");
        image = imageString.startsWith("data:image")
          ? imageString
          : `data:image/png;base64,${image.toString("base64")}`;
      } else if (image && typeof image === "string") {
        image = image.startsWith("data:image")
          ? image
          : `data:image/png;base64,${image}`;
      } else {
        image = null;
      }

      return {
        ...productData,
        image,
      };
    });

    return {
      EM: "Ok!",
      EC: 0,
      DT: formattedProducts,
    };
  } catch (error) {
    return {
      EM: "Function is not performed! ",
      EC: -1,
      DT: [],
    };
  }
};

export default {
  createUser,
  getAllUsers,
  updateUser,
  deleteUser,
  register,
  verifyEmail,
  getAllProvinceDistrictWard,
  searchHomePage,
};
