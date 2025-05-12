import db from "../models/index.js";
import { Sequelize, Op, where } from "sequelize";
import moment from "moment";

const adminDashboardSummary = async () => {
  try {
    const DaysAgo = moment().subtract(5, "days").toDate();
    const warningUsersCount = await db.User.count({
      where: {
        isDelete: "false",
        role: "customer",
        id: {
          [Op.notIn]: db.sequelize.literal(`(
                        SELECT DISTINCT userId 
                        FROM Orders 
                        WHERE createdAt >= '${DaysAgo.toISOString()}'
                    )`),
        },
      },
    });

    const totalProducts = await db.Product.count();

    const totalUsers = await db.User.count();

    const totalRevenue = await db.Order.sum("total_amount", {
      where: {
        status: "delivering",
      },
    });

    const totalOrderFails = await db.Order.count({
      where: {
        status: "failed",
      },
    });
    const totalOrderSuccess = await db.Order.count({
      where: {
        status: "delivering",
      },
    });

    const totalOrders = await db.Order.count({
      where: {
        status: {
          [Op.in]: ["delivering", "failed", "Processing", "confirmed"],
        },
      },
    });

    const monthlyOrders = await db.Order.findAll({
      attributes: [
        [
          db.sequelize.fn(
            "DATE_FORMAT",
            db.sequelize.col("createdAt"),
            "%Y-%m"
          ),
          "month",
        ],
        [db.sequelize.fn("count", db.sequelize.col("id")), "totalOrders"],
      ],
      group: ["month"],
      order: [
        [
          db.sequelize.fn(
            "DATE_FORMAT",
            db.sequelize.col("createdAt"),
            "%Y-%m"
          ),
          "ASC",
        ],
      ],
    });

    const monthlyRevenueByStore = await db.Order.findAll({
      attributes: [
        [
          db.sequelize.fn(
            "DATE_FORMAT",
            db.sequelize.col("Order.createdAt"),
            "%Y-%m"
          ),
          "month",
        ],
        [
          db.sequelize.fn("sum", db.sequelize.col("Order.total_amount")),
          "totalRevenue",
        ],
      ],
      where: {
        status: "delivering",
      },
      group: [
        db.sequelize.fn(
          "DATE_FORMAT",
          db.sequelize.col("Order.createdAt"),
          "%Y-%m"
        ),
      ],
      order: [
        [
          db.sequelize.fn(
            "DATE_FORMAT",
            db.sequelize.col("createdAt"),
            "%Y-%m"
          ),
          "ASC",
        ],
      ],
    });

    return {
      EM: "Get all success!",
      EC: 0,
      DT: {
        warningUsersCount: warningUsersCount,
        totalProducts: totalProducts,
        totalUsers: totalUsers,
        totalRevenue: totalRevenue,
        totalOrderFails: totalOrderFails,
        totalOrderSuccess: totalOrderSuccess,
        monthlyOrders: monthlyOrders,
        monthlyRevenueByStore: monthlyRevenueByStore,
        totalOrders: totalOrders,
      },
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

const findInactiveAccounts = async (page, limit) => {
  try {
    let offset = (page - 1) * limit;
    const DaysAgo = moment().subtract(5, "days").toDate();

    const { count, rows } = await db.User.findAndCountAll({
      where: {
        isDelete: "false",
        role: "customer",
        id: {
          [Op.notIn]: Sequelize.literal(`(
                        SELECT DISTINCT \`userId\`
                        FROM \`Orders\`
                        WHERE \`createdAt\` >= '${DaysAgo.toISOString()}'
                    )`),
        },
      },
      attributes: [
        "id",
        "username",
        "email",
        "phonenumber",
        [
          Sequelize.literal(`(
                        SELECT MAX(\`createdAt\`)
                        FROM \`Orders\`
                        WHERE \`Orders\`.\`userId\` = \`User\`.\`id\`
                    )`),
          "lastOrderDate",
        ],
      ],
      offset: offset,
      limit: limit,
      order: [
        [Sequelize.literal("lastOrderDate IS NULL, lastOrderDate"), "ASC"],
      ],
    });

    const users = rows.map((user) => {
      const lastOrderDate = user.getDataValue("lastOrderDate");
      const inactiveDays = lastOrderDate
        ? Math.floor(
            (new Date() - new Date(lastOrderDate)) / (1000 * 60 * 60 * 24)
          )
        : null;
      return {
        ...user.toJSON(),
        inactiveDays,
      };
    });

    users.sort((a, b) => b.inactiveDays - a.inactiveDays);

    let totalPages = Math.ceil(count / limit);
    let data = {
      totalPages: totalPages,
      totalRow: count,
      users: users,
    };

    return {
      EM: "OK",
      EC: 0,
      DT: data,
    };
  } catch (error) {
    console.log(error);
    return {
      EM: "Something went wrong with services",
      EC: -1,
      DT: [],
    };
  }
};

const dashboardOrder = async (page, limit, searchDate) => {
  try {
    let whereClause = {
      status: {
        [Op.in]: ["delivering", "failed", "Processing", "confirmed"],
      },
    };

    if (searchDate) {
      const startDate = new Date(searchDate);
      const endDate = new Date(searchDate);
      endDate.setDate(endDate.getDate() + 1);

      whereClause.createdAt = {
        [Op.gte]: startDate,
        [Op.lt]: endDate,
      };
    }

    const { count, rows } = await db.Order.findAndCountAll({
      where: whereClause,
      attributes: [
        "id",
        "total_amount",
        "customerName",
        "phonenumber",
        "address_detail",
        "createdAt",
      ],
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: db.User,
          attributes: ["username", "id", "phonenumber"],
        },
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
                  attributes: ["name", "id"],
                },
              ],
            },
          ],
        },
      ],
    });

    const groupedOrders = rows.reduce((acc, order) => {
      const orderDate = new Date(order.createdAt).toLocaleDateString("vi-VN");
      if (!acc[orderDate]) {
        acc[orderDate] = [];
      }
      acc[orderDate].push(order);
      return acc;
    }, {});

    const groupedArray = Object.keys(groupedOrders)
      .sort(
        (a, b) =>
          new Date(b.split("/").reverse().join("-")) -
          new Date(a.split("/").reverse().join("-"))
      )
      .map((date) => ({
        date,
        orders: groupedOrders[date],
        orderCount: groupedOrders[date].length,
      }));

    const totalGroupedCount = groupedArray.length;
    const totalPages = Math.ceil(totalGroupedCount / limit);

    const offset = (page - 1) * limit;
    const paginatedGroupedOrders = groupedArray.slice(offset, offset + limit);

    let data = {
      totalPages: totalPages,
      totalRow: totalGroupedCount,
      orders: paginatedGroupedOrders,
    };

    return {
      EM: "OK",
      EC: 0,
      DT: data,
    };
  } catch (error) {
    console.log(error);
    return {
      EM: "Something went wrong with the service",
      EC: -1,
      DT: [],
    };
  }
};

const adminDashboardUser = async (page, limit) => {
  try {
    let offset = (page - 1) * limit;
    const { count, rows } = await db.User.findAndCountAll({
      offset: offset,
      limit: limit,
      attributes: ["id", "username", "email", "phonenumber", "role"],
      order: [["id", "DESC"]],
      include: [
        { model: db.Province, attributes: ["id", "province_name"] },
        { model: db.District, attributes: ["id", "district_name"] },
        { model: db.Ward, attributes: ["id", "ward_name"] },
      ],
    });
    let totalPages = Math.ceil(count / limit);
    let data = {
      totalPages: totalPages,
      totalRow: count,
      users: rows,
    };
    return {
      EM: "OK",
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

const adminDashboardProduct = async (page, limit) => {
  try {
    let offset = (page - 1) * limit;
    const { count, rows } = await db.Product.findAndCountAll({
      offset: offset,
      limit: limit,
      where: { isDelete: "false" },
      attributes: ["id", "name", "price", "view_count", "image"],
      order: [["id", "DESC"]],
      include: [
        {
          model: db.Category,
          attributes: ["name", "id"],
        },
      ],
    });

    rows.forEach((product) => {
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
      } else {
        product.image = null;
      }
    });

    let totalPages = Math.ceil(count / limit);
    let data = {
      totalPages: totalPages,
      totalRow: count,
      products: rows,
    };

    return {
      EM: "OK",
      EC: 0,
      DT: data,
    };
  } catch (error) {
    console.error("Error in adminDashboardProduct:", error);
    return {
      EM: "Something went wrong with services",
      EC: -1,
      DT: [],
    };
  }
};

const storeDashboardRevenue = async (page, limit) => {
  try {
    let offset = (page - 1) * limit;
    const dailyRevenue = await db.Order.findAll({
      where: {
        status: "delivering",
      },
      attributes: [
        [db.Sequelize.fn("DATE", db.Sequelize.col("createdAt")), "createdAt"],
        [
          db.Sequelize.fn("SUM", db.Sequelize.col("total_amount")),
          "total_revenue",
        ],
        [db.Sequelize.fn("COUNT", db.Sequelize.col("id")), "order_count"],
      ],
      group: [Sequelize.fn("DATE", Sequelize.col("createdAt"))],
      order: [[Sequelize.fn("DATE", Sequelize.col("createdAt")), "DESC"]],
      limit: limit,
      offset: offset,
    });
    const countResult = await db.Order.findAll({
      where: {
        status: "delivering",
      },
      attributes: [
        [
          Sequelize.fn(
            "DISTINCT",
            Sequelize.fn("DATE", Sequelize.col("createdAt"))
          ),
          "distinct_dates",
        ],
      ],
    });
    const totalDistinctDates = countResult.length;
    const totalPages = Math.ceil(totalDistinctDates / limit);
    let data = {
      totalPages: totalPages,
      totalRow: totalDistinctDates,
      dailyRevenue: dailyRevenue,
    };
    return {
      EM: "OK",
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

const storeDashboardRevenueByDate = async (page, limit, date) => {
  try {
    let offset = (page - 1) * limit;
    const { count, rows } = await db.Order.findAndCountAll({
      offset: offset,
      limit: limit,
      where: {
        status: "delivering",
        createdAt: {
          [db.Sequelize.Op.between]: [`${date} 00:00:00`, `${date} 23:59:59`],
        },
      },
      attributes: [
        "total_amount",
        "id",
        "customerName",
        "phonenumber",
        "address_detail",
      ],
      order: [["id", "DESC"]],
      include: [
        {
          model: db.User,
          attributes: ["username", "id", "phonenumber"],
        },
        {
          model: db.OrderItem,
          attributes: ["quantily", "id"],
          include: [
            {
              model: db.ProductAttribute,
              attributes: ["id", "color", "size"],
              include: [
                {
                  model: db.Product,
                  attributes: ["name", "id"],
                },
              ],
            },
          ],
        },
      ],
    });

    let totalPages = Math.ceil(count / limit);
    let data = {
      totalPages: totalPages,
      totalRow: count,
      orders: rows,
    };

    return {
      EM: "OK",
      EC: 0,
      DT: data,
    };
  } catch (error) {
    console.log(error);
    return {
      EM: "Something wrong with services",
      EC: -1,
      DT: [],
    };
  }
};

const dashboardAdminService = {
  findInactiveAccounts,
  adminDashboardSummary,
  dashboardOrder,
  adminDashboardUser,
  adminDashboardProduct,
  storeDashboardRevenue,
  storeDashboardRevenueByDate,
};
export default dashboardAdminService;
