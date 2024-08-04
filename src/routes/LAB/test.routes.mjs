import { Router } from "express";
import { LabChargesCheck, labTest, LabTestToUpdate } from "../../controllers/LABS/test.controller.mjs";

const router = Router();

router.route("/test").post(labTest);
router.route("/tests").get(LabTestToUpdate);
router.route("/testsCharges").get(LabChargesCheck);

export default router;
