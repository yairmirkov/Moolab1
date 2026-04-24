import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import childrenRouter from "./children";
import pexelsRouter from "./pexels";
import stocksRouter from "./stocks";
import geminiRouter from "./gemini";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(childrenRouter);
router.use(pexelsRouter);
router.use(stocksRouter);
router.use(geminiRouter);

export default router;
