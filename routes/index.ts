import express from "express";
const router = express.Router();
import userRouter from "./userRouter";
import trelloRouter from "./trelloRouter";

router.use("/user", userRouter);
router.use("/trello", trelloRouter);
export default router;
