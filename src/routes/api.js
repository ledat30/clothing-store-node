import express from "express";
import userController from "../controller/userController.js";
import categoryController from "../controller/categoryController.js";

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
  router.get("/category", categoryController.getAllCategory);
  router.put('/category/:id', categoryController.updateCategory);
  router.delete('/category/:id', categoryController.deleteCategory);

  return app.use("/api", router);
};

export default initApiRouter;