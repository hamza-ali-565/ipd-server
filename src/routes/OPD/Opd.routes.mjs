import { Router } from "express";
import {
  FindDrCharges,
  FindDrChargesPartyWise,
  OpdConsCharges,
} from "../../controllers/OPD/ConsCharges.controller.mjs";
import { ConsultantSchedule } from "../../controllers/OPD/Speciality.controller.mjs";
import {
  OPDRefund,
  OPDRegistration,
  OPDToken,
  OPDToPrint,
  registeredOPD,
  updateIsDelete,
} from "../../controllers/OPD/OpdReg.controller.mjs";

const router = Router();

router.route("/opdConsCharges").post(OpdConsCharges);
router.route("/findDrCharges").get(FindDrCharges);
router.route("/consultantSchedule").get(ConsultantSchedule);
router.route("/findDrChargesPartyWise").get(FindDrChargesPartyWise);
router.route("/opdRegistraion").post(OPDRegistration);
router.route("/lastToken").get(OPDToken);
router.route("/registeredOpd").get(registeredOPD);
router.route("/updateMore").put(updateIsDelete);
router.route("/forPrintdata").get(OPDToPrint);
router.route("/opdRefund").put(OPDRefund);

export default router;
