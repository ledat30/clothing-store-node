import categoryService from "../service/categoryService.js";

const createCategory = async (req, res) => {
    try {
        const { name} = req.body;

        if (!name ) {
            return res.status(400).json({ message: "All fields are required." });
        }

        const data = await categoryService.createCategory({ name});
        res.status(201).json({
            EM: data.EM,
            EC: data.EC,
            DT: data.DT,
        });
    } catch (error) {
        res.status(500).json({
            EM: "Create category error" + error.message,
            EC: "-1",
            DT: "",
        });
    }
};

const getAllCategory = async (req, res) => {
    try {
        const { limit = 10, page = 1, search = "" } = req.query;
        const data = await categoryService.getAllCategory(limit, page, search);
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
            EM: "Get all category error" + error.message,
            EC: "-1",
            DT: "",
        });
    }
};

const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const userData = req.body;

        const data = await categoryService.updateCategory(id, userData);

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
            EM: "Update category error: " + error.message,
            EC: "-1",
            DT: "",
        });
    }
};

const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const data = await categoryService.deleteCategory(id);

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
            EM: "Delete category error: " + error.message,
            EC: "-1",
            DT: "",
        });
    }
};

export default { createCategory ,getAllCategory, updateCategory, deleteCategory};