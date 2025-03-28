import express from "express";
const router = express.Router();
import userController from "../controllers/UserController";
import authHandlingMiddleware from "../middleware/AuthHandlingMiddleware";

router.post("/login", userController.login);
router.get("/refresh", userController.refresh);
router.get("/logout", userController.logout);

export default router;
