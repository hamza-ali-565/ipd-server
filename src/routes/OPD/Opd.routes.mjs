import { Router } from "express";
import {
  FindDrCharges,
  FindDrChargesPartyWise,
  OpdConsCharges,
} from "../../controllers/OPD/ConsCharges.controller.mjs";
import { ConsultantSchedule } from "../../controllers/OPD/Speciality.controller.mjs";

const router = Router();

router.route("/opdConsCharges").post(OpdConsCharges);
router.route("/findDrCharges").get(FindDrCharges);
router.route("/consultantSchedule").get(ConsultantSchedule);
router.route("/findDrChargesPartyWise").get(FindDrChargesPartyWise);

export default router;
