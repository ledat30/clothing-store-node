import db from "../models/index.js";
const { sequelize } = db;
import { Op } from "sequelize";

const createProduct = async ({
  name,
  description,
  image,
  price,
  contentHtml,
  contentMarkdown,
  category_id,
  variants,
}) => {
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
      isDelete: "false",
    });

    if (variants && Array.isArray(variants) && variants.length > 0) {
      for (const variant of variants) {
        if (!variant.color || !variant.size || !variant.quantity) {
          throw new Error(`Invalid variant: Missing color, size, or quantity.`);
        }
      }

      const variantData = variants.map((variant) => ({
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

    const formattedProducts = products.map((product) => {
      if (product.image && Buffer.isBuffer(product.image)) {
        const imageString = product.image.toString("utf8");

        if (imageString.startsWith("data:image")) {
          product.image = imageString;
        } else {
          const base64Image = product.image.toString("base64");
          product.image = `data:image/png;base64,${base64Image}`;
        }
      } else if (product.image && typeof product.image === "string") {
        product.image = product.image.startsWith("data:image")
          ? product.image
          : `data:image/png;base64,${product.image}`;
      } else {
        product.image = null;
      }
      return product;
    });

    return {
      EM: "Get all successfully!",
      EC: "0",
      DT: formattedProducts,
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
  try {
    const product = await db.Product.findOne({
      where: { id, isDelete: "false" },
    });
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
          attributes: ["id", "color", "size", "quantity", "isDelete"],
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
    const product = await db.Product.findOne({
      where: { id, isDelete: "false" },
    });
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

const findOneProduct = async (productId) => {
  try {
    const data = await db.Product.findOne({
      where: { id: productId, isDelete: "false" },
      attributes: [
        "id",
        "name",
        "price",
        "image",
        "view_count",
        "description",
        "contentMarkdown",
        "contentHtml",
      ],
      include: [
        {
          model: db.ProductAttribute,
          where: { isDelete: "false" },
          required: false,
          attributes: ["id", "color", "size", "quantity"],
        },
      ],
    });

    if (!data) {
      return {
        EM: "Product not found",
        EC: "-1",
        DT: null,
        totalCount: 0,
      };
    }

    let formattedProduct = { ...data.get() };
    if (formattedProduct.image && Buffer.isBuffer(formattedProduct.image)) {
      const imageString = formattedProduct.image.toString("utf8");
      formattedProduct.image = imageString.startsWith("data:image")
        ? imageString
        : `data:image/png;base64,${formattedProduct.image.toString("base64")}`;
    } else {
      formattedProduct.image = null;
    }

    return {
      EM: "Get product detail successfully!",
      EC: "0",
      DT: {
        products: formattedProduct, // Trả về object thay vì mảng
      },
    };
  } catch (error) {
    return {
      EM: "Error getting product detail: " + error.message,
      EC: "-1",
      DT: null,
      totalCount: 0,
    };
  }
};

const increaseCount = async (inputId) => {
  try {
    const product = await db.Product.findOne({
      where: {
        id: inputId,
      },
    });
    if (!product) {
      throw new Error("Product not found");
    }
    product.view_count += 1;
    await db.Product.update(
      { view_count: product.view_count },
      { where: { id: inputId } }
    );
    return {
      EM: "Ok",
      EC: 0,
      DT: "",
    };
  } catch (error) {
    throw error;
  }
};

const postAddToCart = async (
  product_attribute_value_Id,
  userId,
  provinceId,
  districtId,
  wardId,
  body
) => {
  try {
    let order = await db.Order.findOne({
      where: {
        userId: userId,
        status: "pending",
      },
    });

    if (order) {
      let orderItem = await db.OrderItem.findOne({
        where: {
          orderId: order.id,
          product_AttributeId: product_attribute_value_Id,
        },
      });

      if (orderItem) {
        orderItem.quantily += body.quantity;
        await orderItem.save();
      } else {
        orderItem = await db.OrderItem.create({
          orderId: order.id,
          product_AttributeId: product_attribute_value_Id,
          quantily: body.quantity,
          price_per_item: body.price_per_item,
        });
      }

      let totalAmount = 0;
      const allOrderItems = await db.OrderItem.findAll({
        where: { orderId: order.id },
      });
      allOrderItems.forEach((item) => {
        totalAmount += item.quantily * item.price_per_item;
      });

      order.total_amount = totalAmount;
      await order.save();

      return {
        EM: "Add to cart success!",
        EC: 0,
        DT: orderItem,
      };
    }

    if (!order) {
      order = await db.Order.create({
        total_amount: 0,
        order_date: new Date(),
        status: "pending",
        payment_method: "cod",
        userId: userId,
        provinceId: provinceId,
        districtId: districtId,
        wardId: wardId,
      });

      let orderItem = await db.OrderItem.create({
        orderId: order.id,
        product_AttributeId: product_attribute_value_Id,
        quantily: body.quantity,
        price_per_item: body.price_per_item,
      });

      let totalAmount = body.quantity * body.price_per_item;
      order.total_amount = totalAmount;
      await order.save();

      return {
        EM: "Add to cart success!",
        EC: 0,
        DT: orderItem,
      };
    }
  } catch (error) {
    console.error(error);
    return {
      EM: "Create error",
      EC: -1,
      DT: "",
    };
  }
};

const getAllProductAddToCart = async (userId) => {
  try {
    const orders = await db.Order.findAll({
      where: { userId, status: "pending" },
      attributes: ["id", "total_amount"],
      include: [
        {
          model: db.OrderItem,
          attributes: ["id", "quantily", "price_per_item"],
          order: [["id", "DESC"]],
          include: [
            {
              model: db.ProductAttribute,
              attributes: ["id", "color", "size", "quantity"],
              include: [
                {
                  model: db.Product,
                  attributes: ["name", "price", "description", "image"],
                },
              ],
            },
          ],
        },
      ],
    });

    if (!orders || orders.length === 0) {
      return {
        EM: "No pending orders found for this user.",
        EC: -1,
        DT: [],
      };
    }

    const filteredOrders = orders.filter(
      (order) => order.OrderItems && order.OrderItems.length > 0
    );

    if (filteredOrders.length === 0) {
      console.log("No OrderItems in orders.");
      return {
        EM: "No products in cart.",
        EC: -1,
        DT: [],
      };
    }

    // Process images
    for (let order of filteredOrders) {
      for (let item of order.OrderItems) {
        const productAttr = item.ProductAttribute;
        const product = productAttr?.Product;

        if (product?.image) {
          let img = product.image;

          if (Buffer.isBuffer(img)) {
            const imageString = img.toString("utf8");
            product.image = imageString.startsWith("data:image")
              ? imageString
              : `data:image/png;base64,${img.toString("base64")}`;
          } else if (typeof img === "string") {
            product.image = img.startsWith("data:image")
              ? img
              : `data:image/png;base64,${img}`;
          } else {
            product.image = null;
          }
        }
      }
    }

    return {
      EM: "Get all products in cart successfully!",
      EC: 0,
      DT: filteredOrders,
    };
  } catch (error) {
    console.error("Error in getAllProductAddToCart:", error);
    return {
      EM: "Something went wrong with service.",
      EC: -1,
      DT: [],
    };
  }
};

const deleteProductCart = async (id) => {
  try {
    let product = await db.OrderItem.findOne({
      where: { id: id },
    });
    if (!product) {
      return {
        EM: "Product not exist",
        EC: 2,
        DT: [],
      };
    }

    let orderId = product.orderId;

    await product.destroy();

    let remainingOrderItems = await db.OrderItem.findAll({
      where: { orderId: orderId },
    });

    if (remainingOrderItems.length === 0) {
      await db.Order.destroy({
        where: { id: orderId },
      });
    }

    return {
      EM: "Delete product successfully!",
      EC: 0,
      DT: [],
    };
  } catch (error) {
    console.log(error);
    return {
      EM: "Error from server",
      EC: 1,
      DT: [],
    };
  }
};

const getRandomProducts = async () => {
  try {
    const allProducts = await db.Product.findAll({
      where: { isDelete: `false` },
      attributes: ["id", "name", "price", "image"],
    });
    if (allProducts && allProducts.length > 0) {
      allProducts.forEach((item) => {
        item.image = new Buffer.from(item.image, "base64").toString("binary");
      });
    }
    const randomProducts = getRandomItemsFromArray(allProducts, 6);
    return randomProducts;
  } catch (error) {
    throw new Error(error.message);
  }
};
const getRandomItemsFromArray = (array, numberOfItems) => {
  const shuffledArray = array.sort(() => 0.5 - Math.random());
  return shuffledArray.slice(0, numberOfItems);
};

const createBuyProduct = async (orderId, product_attribute_value_Id, body) => {
  const purchaseQuantity = parseInt(body.quantily);
  const pricePerItem = parseFloat(body.price_per_item);
  const shippingFee = parseFloat(body.shippingFee);
  const transaction = await sequelize.transaction();
  const wardId = body.ward;
  const provinceId = body.province;
  const districtId = body.district;
  const customerName = body.customerName;
  const address_detail = body.address_detail;
  const phonenumber = body.phonenumber;

  try {
    const order = await db.Order.findByPk(orderId, { transaction });
    if (!order) {
      throw new Error("Order not found.");
    }

    const item = await db.OrderItem.findOne({
      where: {
        orderId: orderId,
        product_AttributeId: product_attribute_value_Id,
      },
      transaction,
    });

    if (!item) throw new Error("Product not found in order.");

    let newOrder = null;

    if (purchaseQuantity === item.quantily) {
      await order.update(
        {
          status: "Processing",
          payment_method: "ship cod",
          total_amount: pricePerItem * purchaseQuantity + shippingFee,
          provinceId: provinceId,
          districtId: districtId,
          wardId: wardId,
          customerName: customerName,
          phonenumber: phonenumber,
          address_detail: address_detail,
        },
        { transaction }
      );
    } else {
      newOrder = await db.Order.create(
        {
          userId: order.userId,
          status: "Processing",
          total_amount: pricePerItem * purchaseQuantity + shippingFee,
          order_date: new Date(),
          payment_method: "ship cod",
          provinceId: provinceId,
          districtId: districtId,
          wardId: wardId,
          phonenumber: phonenumber,
          address_detail: address_detail,
          customerName: customerName,
        },
        { transaction }
      );

      await item.update(
        { quantily: purchaseQuantity, orderId: newOrder.id },
        { transaction }
      );
    }

    // Update Inventory
    const productColorSize = await db.ProductAttribute.findByPk(
      item.product_AttributeId
    );
    if (!productColorSize) {
      throw new Error("Product color size not found.");
    }

    const updatedCurrentNumber = productColorSize.quantity - purchaseQuantity;
    await productColorSize.update(
      { quantity: updatedCurrentNumber },
      { transaction }
    );

    //end
    await transaction.commit();
    return {
      EM: "Update successful",
      EC: 0,
      DT: { orderId: newOrder ? newOrder.id : order.id },
    };
  } catch (error) {
    console.error("Transaction error:", error);
    await transaction.rollback();
    throw error;
  }
};

const buyNowProduct = async (product_attribute_value_Id, userId, body) => {
  try {
    let order = await db.Order.findOne({
      where: { userId: userId, createdAt: new Date() },
    });
    let newOrder;
    if (!order) {
      newOrder = await db.Order.create({
        total_amount: body.total,
        status: "Processing",
        payment_method: "ship cod",
        userId: userId,
        provinceId: body.province,
        districtId: body.district,
        wardId: body.ward,
        phonenumber: body.phonenumber,
        customerName: body.customerName,
        address_detail: body.address_detail,
      });
    } else {
      newOrder = order;
    }
    let orderItem = await db.OrderItem.findOne({
      where: {
        orderId: newOrder.id,
        product_AttributeId: product_attribute_value_Id,
      },
    });
    if (!orderItem) {
      orderItem = await db.OrderItem.create({
        orderId: newOrder.id,
        product_AttributeId: product_attribute_value_Id,
        quantily: body.quantily,
        price_per_item: body.price_item,
      });
    }

    const productColorSize = await db.ProductAttribute.findByPk(
      orderItem.product_AttributeId
    );

    if (!productColorSize) {
      throw new Error("Product color size not found.");
    }

    const updatedCurrentNumber =
      Number(productColorSize.quantity) - Number(body.quantily);

    await productColorSize.update({ quantity: updatedCurrentNumber });
    return {
      EM: "Buy now success!",
      EC: 0,
      DT: "",
    };
  } catch (error) {
    console.error(error);
    return {
      EM: "Create error",
      EC: -1,
      DT: "",
    };
  }
};

const readAllOrderByAdmin = async (page, limit, role, search = "") => {
  try {
    if (role !== "admin") {
      return {
        EM: "Permission denied. Admins only.",
        EC: -2,
        DT: [],
      };
    }

    const offset = (page - 1) * limit;

    // Đếm tổng đơn hàng với điều kiện search
    const count = await db.Order.count({
      where: { status: "Processing" },
      include: [
        {
          model: db.User,
          where: {
            username: {
              [Op.substring]: search,
            },
          },
        },
      ],
    });

    const rows = await db.Order.findAll({
      where: { status: "Processing" },
      attributes: [
        "id",
        "status",
        "userId",
        "total_amount",
        "phonenumber",
        "customerName",
        "address_detail",
      ],
      offset: offset,
      limit: limit,
      include: [
        {
          model: db.OrderItem,
          attributes: ["quantily", "price_per_item", "id"],
          include: [
            {
              model: db.ProductAttribute,
              attributes: ["id", "color", "size", "quantity"],
              include: [
                {
                  model: db.Product,
                  attributes: ["name", "image", "price"],
                },
              ],
            },
          ],
        },
        {
          model: db.User,
          attributes: ["username", "phonenumber", "id"],
          where: {
            username: {
              [Op.substring]: search,
            },
          },
        },
        {
          model: db.Province,
          attributes: ["province_name"],
        },
        {
          model: db.District,
          attributes: ["district_name"],
        },
        {
          model: db.Ward,
          attributes: ["ward_name"],
        },
      ],
    });

    // Xử lý ảnh base64
    rows.forEach((order) => {
      order.OrderItems.forEach((orderItem) => {
        const product = orderItem.ProductAttribute?.Product;
        if (product?.image) {
          if (Buffer.isBuffer(product.image)) {
            const imageString = product.image.toString("utf8");
            product.image = imageString.startsWith("data:image")
              ? imageString
              : `data:image/png;base64,${product.image.toString("base64")}`;
          } else if (typeof product.image === "string") {
            product.image = product.image.startsWith("data:image")
              ? product.image
              : `data:image/png;base64,${product.image}`;
          } else {
            product.image = null;
          }
        }
      });
    });

    const totalPages = Math.ceil(count / limit);

    return {
      EM: "Get all order for admin",
      EC: 0,
      DT: {
        totalPages: totalPages,
        totalRow: count,
        orders: rows,
      },
    };
  } catch (error) {
    console.log(error);
    return {
      EM: "Something wrongs with services",
      EC: -1,
      DT: [],
    };
  }
};

const ConfirmOrdersByTransfer = async (body) => {
  const transaction = await sequelize.transaction();

  try {
    await db.Order.update(
      { status: "confirmed" },
      {
        where: { status: "Processing", id: body.id },
        returning: true,
        transaction,
      }
    );

    const confirmedOrder = await db.Order.findOne({
      where: { status: "confirmed", id: body.id },
      transaction,
    });

    if (!confirmedOrder) {
      throw new Error("Order not found or not confirmed");
    }

    await transaction.commit();
    return { EM: "Order confirmed successfully", EC: 0, DT: "" };
  } catch (error) {
    await transaction.rollback();
    console.error("Error confirming order:", error);
    return { EM: "Failed to confirm order", EC: -1, DT: "" };
  }
};

const getreadStatusOrderWithPagination = async (page, limit, userId) => {
  try {
    let offset = (page - 1) * limit;
    const { count, rows } = await db.Order.findAndCountAll({
      offset: offset,
      limit: limit,
      where: {
        userId: userId,
        status: {
          [db.Sequelize.Op.ne]: "pending",
        },
      },
      attributes: ["id", "total_amount", "status"],
      order: [["id", "DESC"]],
      include: [
        {
          model: db.OrderItem,
          attributes: ["id", "quantily", "price_per_item"],
          include: [
            {
              model: db.ProductAttribute,
              attributes: ["id", "color", "size", "quantity"],
              include: [
                {
                  model: db.Product,
                  attributes: ["name", "image"],
                },
              ],
            },
          ],
        },
      ],
    });

    rows.forEach((order) => {
      order.OrderItems.forEach((orderItem) => {
        const product = orderItem.ProductAttribute?.Product;
        if (product?.image) {
          if (Buffer.isBuffer(product.image)) {
            const imageString = product.image.toString("utf8");
            product.image = imageString.startsWith("data:image")
              ? imageString
              : `data:image/png;base64,${product.image.toString("base64")}`;
          } else if (typeof product.image === "string") {
            product.image = product.image.startsWith("data:image")
              ? product.image
              : `data:image/png;base64,${product.image}`;
          } else {
            product.image = null;
          }
        }
      });
    });

    let totalPages = Math.ceil(count / limit);
    let data = {
      totalPages: totalPages,
      totalRow: count,
      products: rows,
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
};

const productService = {
  createProduct,
  getAllProduct,
  updateProduct,
  deleteProduct,
  findOneProduct,
  postAddToCart,
  getAllProductAddToCart,
  deleteProductCart,
  getRandomProducts,
  createBuyProduct,
  buyNowProduct,
  increaseCount,
  readAllOrderByAdmin,
  ConfirmOrdersByTransfer,
  getreadStatusOrderWithPagination,
};

export default productService;
