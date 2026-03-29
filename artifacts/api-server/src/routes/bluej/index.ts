import { Router, type IRouter } from "express";
import chatRouter from "./chat.js";
import ttsRouter from "./tts.js";
import sttRouter from "./stt.js";
import progressRouter from "./progress.js";
import downloadRouter from "./download.js";
import simulateRouter from "./simulate.js";
import optimizeRouter from "./optimize.js";
import diagnosticRouter from "./diagnostic.js";

const router: IRouter = Router();

router.use("/chat", chatRouter);
router.use("/tts", ttsRouter);
router.use("/stt", sttRouter);
router.use("/progress", progressRouter);
router.use("/download", downloadRouter);
router.use("/simulate", simulateRouter);
router.use("/optimize", optimizeRouter);
router.use("/diagnostic", diagnosticRouter);

export default router;
