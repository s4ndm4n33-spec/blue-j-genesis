import { Router, type IRouter } from "express";
import chatRouter from "./chat.js";
import ttsRouter from "./tts.js";
import progressRouter from "./progress.js";
import downloadRouter from "./download.js";

const router: IRouter = Router();

router.use("/chat", chatRouter);
router.use("/tts", ttsRouter);
router.use("/progress", progressRouter);
router.use("/download", downloadRouter);

export default router;
