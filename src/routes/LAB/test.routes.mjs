import { Router } from "express";
import { labTest } from "../../controllers/LABS/test.controller.mjs";

const router = Router();

router.route("/test").post(labTest);

export default router;
