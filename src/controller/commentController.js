import commentService from "../service/commentService.js";

const readFunc = async (req, res) => {
  try {
    const productId = req.query.productId;
    if (req.query.page && req.query.limit) {
      let page = req.query.page;
      let limit = req.query.limit;

      let data = await commentService.getCommentWithPagination(
        +page,
        +limit,
        productId
      );

      return res.status(200).json({
        EM: data.EM,
        EC: data.EC,
        DT: data.DT,
      });
    } else {
      let data = await commentService.getAllComment();

      return res.status(200).json({
        EM: data.EM,
        EC: data.EC,
        DT: data.DT,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      EM: "Error",
      EC: "-1",
      DT: "",
    });
  }
};

const createFunc = async (req, res) => {
  try {
    let data = await commentService.createComment(
      req.body,
      req.query.productId,
      req.query.userId
    );
    return res.status(200).json({
      EM: data.EM,
      EC: data.EC,
      DT: data.DT,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      EM: "Create comment error",
      EC: "-1",
      DT: "",
    });
  }
};

const deleteFunc = async (req, res) => {
  try {
    let data = await commentService.deleteCommentByIdUser(
      req.body.id,
      req.query.userId
    );
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

const readFuncAdmin = async (req, res) => {
  try {
    if (req.query.page && req.query.limit) {
      let page = req.query.page;
      let limit = req.query.limit;

      let data = await commentService.readFuncAdmin(+page, +limit);

      return res.status(200).json({
        EM: data.EM,
        EC: data.EC,
        DT: data.DT,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      EM: "Error",
      EC: "-1",
      DT: "",
    });
  }
};

const deleteFuncAdmin = async (req, res) => {
  try {
    let data = await commentService.deleteFuncAdmin(req.body.id);
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

const searchComment = async (req, res) => {
  try {
    const keyword = req.query.q;
    const data = await commentService.searchComment(keyword);
    return res.status(200).json({
      EM: data.EM,
      EC: data.EC,
      DT: data.DT,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      EM: "Error from the server",
      EC: -1,
      DT: "",
    });
  }
};

const commentController = {
  readFunc,
  createFunc,
  deleteFunc,
  readFuncAdmin,
  deleteFuncAdmin,
  searchComment,
};
export default commentController;
