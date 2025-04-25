import express from "express";
import userController from "../controller/userController.js";
import categoryController from "../controller/categoryController.js";
import productController from "../controller/productController.js";

const router = express.Router();

/**
 *
 * @param {*} app : express app
 */
const initApiRouter = (app) => {
  router.post("/users", userController.createUser);
  router.post("/login", userController.login);
  router.get("/users", userController.getAllUsers);
  router.put('/users/:id', userController.updateUser);
  router.delete('/users/:id', userController.deleteUser);
  router.post("/logOut", userController.logOut);
  router.post("/register", userController.register);
  router.post("/verify-email", userController.verifyEmail);

  router.post("/category", categoryController.createCategory);
  router.get("/all/category", categoryController.getAllct);
  router.get("/category", categoryController.getAllCategory);
  router.get('/category/:id', categoryController.findOneCategory);
  router.put('/category/:id', categoryController.updateCategory);
  router.delete('/category/:id', categoryController.deleteCategory);

  router.post("/product", productController.createProduct);
  router.get("/product", productController.getAllProduct);
  router.put('/product/:id', productController.updateProduct);
  router.get('/product/:id', productController.findOneProduct);
  router.delete('/product/:id', productController.deleteProduct);

  return app.use("/api", router);
};

export default initApiRouter;