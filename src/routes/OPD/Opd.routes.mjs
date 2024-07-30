import { Router } from "express";
import { OpdConsCharges } from "../../controllers/OPD/ConsCharges.controller.mjs";

const router = Router()

router.route('/opdConsCharges').post(OpdConsCharges)

export default router