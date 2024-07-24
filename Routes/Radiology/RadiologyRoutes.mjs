import express from "express";
import RadiologyBooking from "../../API/Radiology/Transaction/RadiologyBooking.mjs";

const router = express.Router();

router.use(RadiologyBooking);

export default router;
