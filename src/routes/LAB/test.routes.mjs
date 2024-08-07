import { Router } from "express";
import {
  getPushedChargesData,
  LabChargesCheck,
  LabChargesPush,
  labTest,
  LabTestToUpdate,
} from "../../controllers/LABS/test.controller.mjs";
import { LabBookingCreator } from "../../controllers/LABS/labBooking.controller.mjs";

const router = Router();

// test and groups creation and get data
router.route("/test").post(labTest);
router.route("/tests").get(LabTestToUpdate);
router.route("/testsCharges").get(LabChargesCheck);
router.route("/testsChargesPush").post(LabChargesPush);
router.route("/labsForBooking").get(getPushedChargesData);

// Lab Booking Related
router.route("/labBooking").post(LabBookingCreator);

export default router;
