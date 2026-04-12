import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import childrenRouter from "./children";
import pexelsRouter from "./pexels";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(childrenRouter);
router.use(pexelsRouter);

export default router;
