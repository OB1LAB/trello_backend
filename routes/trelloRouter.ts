import express from "express";
const router = express.Router();
import TrelloController from "../controllers/TrelloController";
import authHandlingMiddleware from "../middleware/AuthHandlingMiddleware";
import adminHandlingMiddleware from "../middleware/AdminHandlingMiddleware";

router.get("/", authHandlingMiddleware, TrelloController.getAll);

router.post(
  "/",
  authHandlingMiddleware,
  adminHandlingMiddleware,
  TrelloController.create,
);

export default router;
