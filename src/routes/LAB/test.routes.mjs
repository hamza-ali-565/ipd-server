import { Router } from "express";
import {
  getPushedChargesData,
  LabChargesCheck,
  LabChargesPush,
  labTest,
  LabTestToUpdate,
} from "../../controllers/LABS/test.controller.mjs";
import {
  BiochemistryTests,
  LabBookingCreator,
  LabDeletion,
  PrevLabs,
  refundAmount,
  refundCreation,
  singleLabPdfPrint,
} from "../../controllers/LABS/labBooking.controller.mjs";
import {
  allDataWithChild,
  bioGroupResult,
  getChildData,
  getDataToEdit,
  getNewRanges,
  labResult,
  LabSpecimen,
  labSpecimenDisp,
  MicroDataParentForw,
  microscopyData,
  microscopyParent,
  UpdateChild,
  updateLabResult,
} from "../../controllers/LABS/labResult.controller.mjs";

const router = Router();

// test and groups creation and get data
router.route("/test").post(labTest);
router.route("/tests").get(LabTestToUpdate);
router.route("/testsCharges").get(LabChargesCheck);
router.route("/testsChargesPush").post(LabChargesPush);
router.route("/labsForBooking").get(getPushedChargesData);
router.route("/labSpecimen").post(LabSpecimen);
router.route("/labSpecimenDisp").get(labSpecimenDisp);
router.route("/labMicroData").post(microscopyData);
router.route("/labMicroDataParent").post(microscopyParent);
router.route("/labMicroData").get(MicroDataParentForw);
router.route("/labMicroDataChild").get(getChildData);
router.route("/labMicNameUpdate").put(UpdateChild);
router.route("/allDataWithChild").get(allDataWithChild);

// Lab Booking Related
router.route("/labBooking").post(LabBookingCreator);
router.route("/labBooking").get(PrevLabs);
router.route("/labBookingForPdf").get(singleLabPdfPrint);
router.route("/labDeletion").put(LabDeletion);
router.route("/labRefundAmount").get(refundAmount);
router.route("/labRefund").put(refundCreation);

// Lab Result Bio
router.route("/biochemistry").get(BiochemistryTests);

// lab result Entry
router.route("/labResultEntry").post(labResult);
router.route("/bioGroupRanges").post(bioGroupResult);

// lab Data for Edit
router.route("/resultEdit").get(getDataToEdit);
router.route("/editRanges").post(getNewRanges);
// lab Update
router.route("/resultUpdate").post(updateLabResult);

export default router;
