import db from "../models/index.js";

const createCategory = async ({ name}) => {
    try {
        const existingUser = await db.Category.findOne({ where: { name } });
        if (existingUser) {
            return {
                EM: "Name already in use.",
                EC: "-1",
                DT: "",
            };
        }

        const newCategory = await db.Category.create({
            name,
        });

        return {
            EM: "Category created successfully!",
            EC: "0",
            DT: newCategory,
        };
    } catch (error) {
        return {
            EM: "Error creating category: " + error.message,
            EC: "-1",
            DT: "",
        };
    }
};

const getAllCategory = async (limit, page, search) => {
    try {
        const offset = (page - 1) * limit;
        const whereClause = {};

        if (search) {
            whereClause.name = {
                [db.Sequelize.Op.like]: `%${search}%`,
            };
        }

        const { count: totalCount, rows: users } = await db.Category.findAndCountAll({
            where: whereClause,
            limit: Number(limit),
            offset: Number(offset),
            order: [['createdAt', 'DESC']],
        });

        return {
            EM: "Get all category successfully!",
            EC: "0",
            DT: users,
            totalCount,
        };
    } catch (error) {
        return {
            EM: "Error Get all category: " + error.message,
            EC: "-1",
            DT: "",
        };
    }
};

const getAllct = async () => {
    try {
        const { rows: users } = await db.Category.findAndCountAll({
            order: [['createdAt', 'DESC']],
        });

        return {
            EM: "Get all category successfully!",
            EC: "0",
            DT: users,
        };
    } catch (error) {
        return {
            EM: "Error Get all category: " + error.message,
            EC: "-1",
            DT: "",
        };
    }
};

const updateCategory = async (id, userData) => {
    try {
        const [updatedRowsCount, updatedRows] = await db.Category.update(userData, {
            where: { id },
            returning: true,
        });

        if (updatedRowsCount === 0) {
            return {
                EM: "Category not found!",
                EC: "-1",
                DT: "",
            };
        }

        const updatedCategory = await db.Category.findByPk(id);

        return {
            EM: "Category updated successfully!",
            EC: "0",
            DT: updatedCategory,
        };
    } catch (error) {
        return {
            EM: "Error updating Category: " + error.message,
            EC: "-1",
            DT: "",
        };
    }
};

const deleteCategory = async (id) => {
    try {
        const category = await db.Category.findByPk(id);

        if (!category) {
            return {
                EM: "Category not found!",
                EC: "-1",
                DT: "",
            };
        }

        await category.destroy();

        return {
            EM: "Category deleted successfully!",
            EC: "0",
            DT: null,
        };
    } catch (error) {
        return {
            EM: "Error deleting Category: " + error.message,
            EC: "-1",
            DT: "",
        };
    }
};

const getCategoryDetail = async (category_id, limit, page, search) => {
    try {
        const offset = (page - 1) * limit;
        const whereClause = { category_id, isDelete: "false" }; // Lọc sản phẩm thuộc danh mục và chưa bị xóa

        // Thêm điều kiện tìm kiếm nếu có
        if (search) {
            whereClause.name = {
                [db.Sequelize.Op.like]: `%${search}%`,
            };
        }

        // Tìm danh mục theo id
        const category = await db.Category.findOne({
            where: { id: category_id },
            attributes: ['id', 'name'], // Chỉ lấy các trường cần thiết
        });
        console.log(`category`, category);

        if (!category) {
            return {
                EM: "Category not found",
                EC: "-1",
                DT: null,
                totalCount: 0,
            };
        }

        // Lấy tổng số sản phẩm và danh sách sản phẩm
        const { count: totalCount, rows: products } = await db.Product.findAndCountAll({
            where: whereClause,
            limit: Number(limit),
            offset: Number(offset),
            order: [['createdAt', 'DESC']],
            attributes: ['id', 'name', 'price', 'image', 'view_count'], // Lấy các trường cần thiết
            include: [
                {
                    model: db.ProductAttribute,
                    where: { isDelete: "false" },
                    required: false,
                    attributes: ['id', 'color', 'size', 'quantity'],
                },
            ],
        });
        console.log(`products`, products);

        // Xử lý hình ảnh (chuyển Buffer thành base64, tương tự getAllProduct)
        const formattedProducts = products.map(product => {
            if (product.image && Buffer.isBuffer(product.image)) {
                const imageString = product.image.toString('utf8');
                product.image = imageString.startsWith('data:image') 
                    ? imageString 
                    : `data:image/png;base64,${product.image.toString('base64')}`;
            } else {
                product.image = null;
            }
            return product;
        });

        return {
            EM: "Get category detail successfully!",
            EC: "0",
            DT: {
                category, // Thông tin danh mục
                products: formattedProducts, // Danh sách sản phẩm
            },
            totalCount,
        };
    } catch (error) {
        return {
            EM: "Error getting category detail: " + error.message,
            EC: "-1",
            DT: null,
            totalCount: 0,
        };
    }
};

export default {createCategory ,getAllCategory,updateCategory, deleteCategory ,getAllct, getCategoryDetail};