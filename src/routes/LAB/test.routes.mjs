import { Router } from "express";
import { labTest, LabTestToUpdate } from "../../controllers/LABS/test.controller.mjs";

const router = Router();

router.route("/test").post(labTest);
router.route("/tests").get(LabTestToUpdate);

export default router;
