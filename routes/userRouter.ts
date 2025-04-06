import express from "express";
const router = express.Router();
import userController from "../controllers/UserController";
import authHandlingMiddleware from "../middleware/AuthHandlingMiddleware";
import adminHandlingMiddleware from "../middleware/AdminHandlingMiddleware";

router.post(
  "/changePassword",
  authHandlingMiddleware,
  userController.changePassword,
);
router.post("/login", userController.login);
router.get("/refresh", userController.refresh);
router.get("/logout", userController.logout);
router.post(
  "/create",
  authHandlingMiddleware,
  adminHandlingMiddleware,
  userController.createUser,
);
router.post(
  "/edit",
  authHandlingMiddleware,
  adminHandlingMiddleware,
  userController.editUser,
);
router.get("/", authHandlingMiddleware, userController.getAll);

export default router;
