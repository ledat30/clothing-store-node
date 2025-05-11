import express from "express";
import userController from "../controller/userController.js";
import categoryController from "../controller/categoryController.js";
import productController from "../controller/productController.js";
import commentController from "../controller/commentController.js";
import dashboardAdminController from "../controller/dashboardAdminController.js";

const router = express.Router();

/**
 *
 * @param {*} app : express app
 */
const initApiRouter = (app) => {
  router.post("/users", userController.createUser);
  router.post("/login", userController.login);
  router.get("/users", userController.getAllUsers);
  router.put("/users/:id", userController.updateUser);
  router.delete("/users/:id", userController.deleteUser);
  router.post("/logOut", userController.logOut);
  router.post("/register", userController.register);
  router.post("/verify-email", userController.verifyEmail);
  router.get(
    "/user/getAllProvinceDistrictWard",
    userController.getAllProvinceDistrictWard
  );

  router.post("/category", categoryController.createCategory);
  router.get("/all/category", categoryController.getAllct);
  router.get("/category", categoryController.getAllCategory);
  router.get("/category/:id", categoryController.findOneCategory);
  router.put("/category/:id", categoryController.updateCategory);
  router.delete("/category/:id", categoryController.deleteCategory);

  router.post("/product", productController.createProduct);
  router.get("/product", productController.getAllProduct);
  router.get("/product/read-product-cart", productController.readProductCart);
  router.delete(
    "/product/delete-product-cart",
    productController.deleteProductCart
  );
  router.get("/random-products", productController.getRandomProducts);
  router.post("/product/buy", productController.createBuyProduct);
  router.post("/product/buy-now", productController.buyNowProduct);
  router.post("/product/add-to-cart", productController.postAddToCart);
  router.get(
    "/order/read_all-orderBy_admin",
    productController.readAllOrderByAdmin
  );
  router.post(
    "/product/confirm-order-by-transfer",
    productController.ConfirmOrdersByTransfer
  );
  router.get(
    "/product/read_status-order",
    productController.readStatusOrderByUser
  );
  router.delete("/product/cancel-order", productController.cancelOrder);
  router.put("/product/:id", productController.updateProduct);
  router.get("/product/:id", productController.findOneProduct);
  router.delete("/product/:id", productController.deleteProduct);

  router.get("/comment/read", commentController.readFunc);
  router.get("/comment/read-admin", commentController.readFuncAdmin);
  router.post("/comment/create", commentController.createFunc);
  router.get("/search-comment", commentController.searchComment);
  router.delete("/comment/delete", commentController.deleteFunc);
  router.delete("/comment/admin-delete", commentController.deleteFuncAdmin);

  router.get("/admin/dashboard-inactiveAccount", dashboardAdminController.findInactiveAccounts);
  router.get("/admin/dashboard-summary", dashboardAdminController.adminDashboardSummary);
  router.get("/admin/dashboard-order", dashboardAdminController.dashboardOrder);
  router.get("/admin/dashboard-user", dashboardAdminController.adminDashboardUser);
  router.get("/admin/dashboard-product", dashboardAdminController.adminDashboardProduct);
  router.get("/admin/dashboard-revenue-by-store", dashboardAdminController.storeDashboardRevenue);
  router.get("/admin/dashboard-revenue-by-date", dashboardAdminController.storeDashboardRevenueByDate);

  return app.use("/api", router);
};

export default initApiRouter;
