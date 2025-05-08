import productService from "../service/productService.js";

const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      image,
      price,
      contentHtml,
      contentMarkdown,
      category_id,
      variants,
    } = req.body;

    if (
      !name ||
      !description ||
      !image ||
      !price ||
      !contentHtml ||
      !contentMarkdown ||
      !category_id
    ) {
      return res
        .status(400)
        .json({ message: "All required fields must be provided." });
    }

    if (variants && Array.isArray(variants)) {
      for (const variant of variants) {
        if (!variant.color || !variant.size || !variant.quantity) {
          return res.status(400).json({
            message: "Each variant must have color, size, and quantity.",
          });
        }
      }
    }

    const data = await productService.createProduct({
      name,
      description,
      image,
      price,
      contentHtml,
      contentMarkdown,
      category_id,
      variants,
    });

    res.status(201).json({
      EM: data.EM,
      EC: data.EC,
      DT: data.DT,
    });
  } catch (error) {
    res.status(500).json({
      EM: "Create product error: " + error.message,
      EC: "-1",
      DT: "",
    });
  }
};

const getAllProduct = async (req, res) => {
  try {
    const { limit = 10, page = 1, search = "" } = req.query;
    const data = await productService.getAllProduct(limit, page, search);
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
      EM: "Get all error" + error.message,
      EC: "-1",
      DT: "",
    });
  }
};

const updateProduct = async (req, res) => {
  const id = req.params.id;
  const { variants, ...productData } = req.body;

  const result = await productService.updateProduct(id, productData, variants);
  if (result.EC === "0") {
    return res.status(200).json(result);
  } else {
    return res.status(400).json(result);
  }
};

const deleteProduct = async (req, res) => {
  const id = req.params.id;

  const result = await productService.deleteProduct(id);
  if (result.EC === "0") {
    return res.status(200).json(result);
  } else {
    return res.status(400).json(result);
  }
};

const findOneProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        EM: "Product ID is required",
        EC: "-1",
        DT: null,
      });
    }

    const data = await productService.findOneProduct(id);
    await productService.increaseCount(id);

    res.status(200).json({
      EM: data.EM,
      EC: data.EC,
      DT: data.DT,
    });
  } catch (error) {
    res.status(500).json({
      EM: "Get product detail error: " + error.message,
      EC: "-1",
      DT: null,
    });
  }
};

const postAddToCart = async (req, res) => {
  try {
    let data = await productService.postAddToCart(
      req.query.product_attribute_value_Id,
      req.query.userId,
      req.query.provinceId,
      req.query.districtId,
      req.query.wardId,
      req.body
    );
    return res.status(200).json({
      EM: data.EM,
      EC: data.EC,
      DT: data.DT,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      EM: "Create error",
      EC: "-1",
      DT: "",
    });
  }
};

const readProductCart = async (req, res) => {
  try {
    const userId = req.query.userId;

    const data = await productService.getAllProductAddToCart(userId);

    return res.status(200).json(data);
  } catch (error) {
    console.error("Controller error:", error);
    return res.status(500).json({
      EM: "Internal server error",
      EC: -1,
      DT: null,
    });
  }
};

const deleteProductCart = async (req, res) => {
  try {
    let data = await productService.deleteProductCart(req.body.id);

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

const getRandomProducts = async (req, res) => {
  try {
    const randomProducts = await productService.getRandomProducts();
    res.json(randomProducts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createBuyProduct = async (req, res) => {
  try {
    const { orderId, product_attribute_value_Id } = req.query;
    let data = await productService.createBuyProduct(
      orderId,
      product_attribute_value_Id,
      req.body
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

const buyNowProduct = async (req, res) => {
  try {
    let data = await productService.buyNowProduct(
      req.query.product_attribute_value_Id,
      req.query.userId,
      req.body
    );
    return res.status(200).json({
      EM: data.EM,
      EC: data.EC,
      DT: data.DT,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      EM: "Create error",
      EC: "-1",
      DT: "",
    });
  }
};

const readAllOrderByAdmin = async (req, res) => {
  try {
    const role = req.query.role;
    const search = req.query.search || "";
    if (req.query.page && req.query.limit) {
      let page = req.query.page;
      let limit = req.query.limit;

      let data = await productService.readAllOrderByAdmin(
        +page,
        +limit,
        role,
        search
      );
      return res.status(200).json({
        EM: data.EM,
        EC: data.EC,
        DT: data.DT,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      EM: "Error service",
      EC: -1,
      DT: "",
    });
  }
};

const ConfirmOrdersByTransfer = async (req, res) => {
  try {
    let data = await productService.ConfirmOrdersByTransfer(req.body);
    return res.status(200).json({
      EM: data.EM,
      EC: data.EC,
      DT: data.DT,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      EM: "Error service",
      EC: -1,
      DT: "",
    });
  }
};

const readStatusOrderByUser = async (req, res) => {
  try {
    const userId = req.query.userId;
    if (req.query.page && req.query.limit) {
      let page = req.query.page;
      let limit = req.query.limit;

      let data = await productService.getreadStatusOrderWithPagination(
        +page,
        +limit,
        userId
      );

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

const productController = {
  createProduct,
  getAllProduct,
  updateProduct,
  deleteProduct,
  findOneProduct,
  postAddToCart,
  readProductCart,
  deleteProductCart,
  getRandomProducts,
  createBuyProduct,
  buyNowProduct,
  readAllOrderByAdmin,
  ConfirmOrdersByTransfer,
  readStatusOrderByUser,
};
export default productController;
