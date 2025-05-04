import db from "../models/index.js";

const getCommentWithPagination = async (page, limit, productId) => {
    try {
        let offset = (page - 1) * limit;
        const { count, rows } = await db.Review.findAndCountAll({
            offset: offset,
            limit: limit,
            where: { productId: productId },
            attributes: [
                "id",
                "content",
                "userId",
                "productId",
            ],
            include: [
                { model: db.User, attributes: ["username"] },
            ],
            order: [["id", "DESC"]],
        });
        let totalPages = Math.ceil(count / limit);
        let data = {
            totalPages: totalPages,
            totalRow: count,
            comment: rows,
        };
        return {
            EM: "Ok",
            EC: 0,
            DT: data,
        };
    } catch (error) {
        console.log(error);
        return {
            EM: "Somnething wrongs with services",
            EC: -1,
            DT: [],
        };
    }
}

const createComment = async (data, productId, userId) => {
    try {
        await db.Review.create({ ...data, productId, userId });
        return {
            EM: "Create comment successful",
            EC: 0,
            DT: [],
        };
    } catch (error) {
        console.log(error);
        return {
            EM: "Something wrongs with services",
            EC: -1,
            DT: [],
        };
    }
}

const deleteCommentByIdUser = async (id, userId) => {
    
    const comment = await db.Review.findOne({ where: { id: id, userId: userId } });

    if (comment) {
        await db.Review.destroy({ where: { id: id, userId: userId } });
        return {
            EM: "Comment deleted successfully",
            EC: 0,
            DT: "",
        };
    }
    else {
        return {
            EM: "Unauthorized to delete this comment",
            EC: -1,
            DT: "",
        };
    }
}

const getAllComment = async () => {
    try {
        let comments = await db.Review.findAll();
        if (comments) {
            return {
                EM: "Get all comments success!",
                EC: 0,
                DT: comments,
            };
        } else {
            return {
                EM: "Get all comment error!",
                EC: 0,
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

const commentService = { getCommentWithPagination, createComment, deleteCommentByIdUser, getAllComment };
export default commentService;