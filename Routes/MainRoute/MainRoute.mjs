import express from "express";
const router = express.Router();

import IPDData from "../IPD/IPDRoutes.mjs";
import RadiologyRoutes from "../Radiology/RadiologyRoutes.mjs";
import GeneralData from "../General/GeneralRoutes.mjs";

router.use(GeneralData);
router.use(IPDData);
router.use(RadiologyRoutes);

export default router;
