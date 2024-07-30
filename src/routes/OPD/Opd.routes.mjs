import { Router } from "express";
import { FindDrCharges, OpdConsCharges } from "../../controllers/OPD/ConsCharges.controller.mjs";

const router = Router()

router.route('/opdConsCharges').post(OpdConsCharges)
router.route('/findDrCharges').get(FindDrCharges)

export default router