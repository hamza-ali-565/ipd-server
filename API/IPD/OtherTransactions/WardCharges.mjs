import express from "express";
import { AdmissionWardChargesModel } from "../../../DBRepo/IPD/OtherTransactions/RunningBillModels/wardChargesModel.mjs";
import { IPDWardChargesModel } from "../../../DBRepo/IPD/Masters/WardChargesIPDModel.mjs";
import {
  AdmissionPartyModel,
  AdmissionWardModel,
} from "../../../DBRepo/IPD/PatientModel/AdmissionDetails/PartyModel.mjs";
import moment from "moment-timezone";

const router = express.Router();

router.post("/admissionwardcharges", async (req, res) => {
  try {
    console.log("body", req.body);
    const {
      wardName,
      bedNo,
      bedId,
      admissionNo,
      mrNo,
      createdUser,
      deletedUser,
      amount,
      remarks,
      roomDate,
    } = req.body;
    if (
      ![
        wardName,
        bedNo,
        bedId,
        admissionNo,
        mrNo,
        createdUser,
        amount,
        roomDate,
      ].every(Boolean)
    )
      throw new Error("ALL PARAMETERS ARE REQUIRED");
    const response = await AdmissionWardChargesModel.create({
      wardName,
      bedNo,
      bedId,
      admissionNo,
      mrNo,
      createdUser,
      createdOn: moment(new Date())
        .tz("Asia/Karachi")
        .format("DD/MM/YYYY HH:mm:ss"),
      amount,
      roomDate: moment(roomDate).format("DD/MM/YYYY"),
      remarks,
    });
    res.status(200).send({ data: response });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

router.get("/admissionbedcharges", async (req, res) => {
  try {
    const { admissionNo } = req.query;
    if (!admissionNo) throw new Error("ADMISSION NO. IS REQUIRED !!!");
    const response = await AdmissionWardChargesModel.find({
      admissionNo,
      isDeleted: false,
    });
    if (response.length <= 0) throw new Error("NO ROOM ADDED YET!!!");
    res.status(200).send({ data: response });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

router.get("/activeward", async (req, res) => {
  try {
    const { admissionNo } = req.query;
    if (!admissionNo) throw new Error("ADMISSION NO IS REQUIRED");
    const wardDetails = await AdmissionWardModel.find({
      admissionNo,
      activeOnAdmission: true,
    });
    const partyDetails = await AdmissionPartyModel.find({
      admissionNo,
      activeOnAdmission: true,
    });

    const response = await IPDWardChargesModel.find({
      party: partyDetails[0]?.party,
      wardName: wardDetails[0]?.wardName,
    });
    // if (response.length <= 0)
    //   throw new Error(
    //     "BED IS NOT ACTIVATED ON THIS PARTY, ENTER CHARGES MANUALLY OR CONTACT TO YOUR IT TEAM."
    //   );
    // console.log("bedId", wardDetails[0]?.bedId.toString());
    const filterData = response[0].bedDetails.filter((items) => {
      return items.bedId.toString() === wardDetails[0]?.bedId.toString();
    });
    const updatedData = filterData.map((items) => ({
      bedCharges: items?.bedCharges,
      bedId: items?.bedId,
      bedNumber: items?.bedNumber,
      wardName: wardDetails[0]?.wardName,
    }));
    res.status(200).send({ data: updatedData });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

router.put("/admissionbedcharges", async (req, res) => {
  try {
    const { admissionNo, _id, deletedUser } = req.body;
    if (!admissionNo || !_id || !deletedUser)
      throw new Error("ALL PARAMETERS ARE REQUIRED!!!");
    const updateData = await AdmissionWardChargesModel.findOneAndUpdate(
      { _id, admissionNo },
      {
        $set: {
          deletedUser,
          deletedOn: moment(new Date())
            .tz("Asia/Karachi")
            .format("DD/MM/YYYY HH:mm:ss"),
          isDeleted: true,
        },
      },
      { new: true }
    );
    res.status(200).send({ data: updateData });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});
export default router;
