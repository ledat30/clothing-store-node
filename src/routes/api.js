import express from "express";
import userController from "../controller/userController.js";

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

  return app.use("/api", router);
};

export default initApiRouter;