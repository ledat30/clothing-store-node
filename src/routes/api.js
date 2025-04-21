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

  return app.use("/api", router);
};

export default initApiRouter;