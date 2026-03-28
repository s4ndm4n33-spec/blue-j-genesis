import { Router, type IRouter } from "express";
import chatRouter from "./chat.js";
import ttsRouter from "./tts.js";
import progressRouter from "./progress.js";

const router: IRouter = Router();

router.use("/chat", chatRouter);
router.use("/tts", ttsRouter);
router.use("/progress", progressRouter);

export default router;
