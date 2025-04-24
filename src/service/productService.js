import db from "../models/index.js";

const createProduct = async ({ name, description, image, price, contentHtml, contentMarkdown, category_id, variants }) => {
    try {
        const existing = await db.Product.findOne({ where: { name } });
        if (existing) {
            return {
                EM: "Name already in use.",
                EC: "-1",
                DT: "",
            };
        }

        const newProduct = await db.Product.create({
            name,
            description,
            image,
            price,
            contentHtml,
            contentMarkdown,
            category_id,
            isDelete: 'false',
        });

        if (variants && Array.isArray(variants) && variants.length > 0) {
            for (const variant of variants) {
                if (!variant.color || !variant.size || !variant.quantity) {
                    throw new Error(`Invalid variant: Missing color, size, or quantity.`);
                }
            }

            const variantData = variants.map(variant => ({
                color: variant.color,
                size: variant.size,
                quantity: variant.quantity,
                productId: newProduct.id,
                isDelete: "false",
            }));

            await db.ProductAttribute.bulkCreate(variantData);
        }

        return {
            EM: "Product and variants created successfully!",
            EC: "0",
            DT: newProduct,
        };
    } catch (error) {
        return {
            EM: "Error creating product: " + error.message,
            EC: "-1",
            DT: "",
        };
    }
};

const getAllProduct = async (limit, page, search) => {
    try {
        const offset = (page - 1) * limit;
        const whereClause = { isDelete: "false" };

        if (search) {
            whereClause.name = {
                [db.Sequelize.Op.like]: `%${search}%`,
            };
        }

        const totalCount = await db.Product.count({ where: whereClause });

        const products = await db.Product.findAll({
            where: whereClause,
            limit: Number(limit),
            offset: Number(offset),
            order: [["createdAt", "DESC"]],
            include: [
                {
                    model: db.ProductAttribute,
                    where: { isDelete: "false" },
                    required: false,
                    attributes: ["id", "color", "size", "quantity"],
                },
            ],
        });

        return {
            EM: "Get all successfully!",
            EC: "0",
            DT: products,
            totalCount,
        };
    } catch (error) {
        return {
            EM: "Error Get all products: " + error.message,
            EC: "-1",
            DT: "",
        };
    }
};

const updateProduct = async (id, data, variants) => {
    console.log(`variants`, variants)
    try {
        const product = await db.Product.findOne({ where: { id, isDelete: "false" } });
        if (!product) {
            return {
                EM: "Product not found or already deleted.",
                EC: "-1",
                DT: "",
            };
        }

        await product.update(data);

        if (Array.isArray(variants)) {
            await db.ProductAttribute.destroy({
                where: { productId: id },
            });

            for (const variant of variants) {
                if (!variant.color || !variant.size || !variant.quantity) {
                    continue;
                }
                await db.ProductAttribute.create({
                    productId: id,
                    color: variant.color,
                    size: variant.size,
                    quantity: variant.quantity,
                    isDelete: variant.isDelete || "false",
                });
            }
        }

        const updatedProduct = await db.Product.findOne({
            where: { id },
            include: [
                {
                    model: db.ProductAttribute,
                    where: { isDelete: "false" },
                    required: false,
                    attributes: ['id', 'color', 'size', 'quantity', 'isDelete'],
                },
            ],
        });

        return {
            EM: "Product and variants updated successfully.",
            EC: "0",
            DT: updatedProduct,
        };
    } catch (error) {
        return {
            EM: "Error updating product: " + error.message,
            EC: "-1",
            DT: "",
        };
    }
};

const deleteProduct = async (id) => {
    try {
        const product = await db.Product.findOne({ where: { id, isDelete: "false" } });
        if (!product) {
            return {
                EM: "Product not found or already deleted.",
                EC: "-1",
                DT: "",
            };
        }

        // Cập nhật isDelete cho product
        await product.update({ isDelete: "true" });

        // Cập nhật isDelete cho tất cả variants liên quan
        await db.ProductAttribute.update(
            { isDelete: "true" },
            { where: { productId: id, isDelete: "false" } }
        );

        return {
            EM: "Product and its variants deleted successfully.",
            EC: "0",
            DT: "",
        };
    } catch (error) {
        return {
            EM: "Error deleting product: " + error.message,
            EC: "-1",
            DT: "",
        };
    }
};

const productService = { createProduct, getAllProduct, updateProduct, deleteProduct };

export default productService;
