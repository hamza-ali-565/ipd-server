import express from "express";
import { AdmissionModel } from "../../../DBRepo/IPD/PatientModel/AdmissionDetails/AdmissionModel.mjs";
import moment from "moment-timezone";
import { IPDBedModel } from "../../../DBRepo/IPD/Masters/IPDBebModel.mjs";

const router = express.Router();

router.put("/dischargePatient", async (req, res) => {
  try {
    const { admissionNo, dischargeUser } = req.body;
    if (![admissionNo, dischargeUser].every(Boolean))
      throw new Error("ALL PARAMETERS ARE REQUIRED");
    const conditionCheck = await AdmissionModel.find({
      admissionNo,
      reAdmissionType: "Correction",
    });
    if (conditionCheck.length <= 0) {
      const updateAdmissionDetail = await AdmissionModel.findOneAndUpdate(
        { admissionNo },
        {
          $set: {
            dischargeUser: dischargeUser,
            dischargeDate: moment(new Date())
              .tz("Asia/Karachi")
              .format("DD/MM/YYYY HH:mm:ss"),
            discharge: true,
          },
        },
        { new: true }
      );
      const updateBed = await IPDBedModel.findOneAndUpdate(
        { admissionNo },
        {
          $set: {
            admissionNo: "",
            mrNo: "",
            reserved: false,
            party: "",
          },
        },
        { new: true }
      );
      res.status(200).json({ message: "Patient Discharged Successfully" });
    } else {
      const updateAdmissionDetail = await AdmissionModel.findOneAndUpdate(
        { admissionNo },
        {
          $set: {
            dischargeUser: dischargeUser,
            discharge: true,
          },
        },
        { new: true }
      );
      const updateBed = await IPDBedModel.findOneAndUpdate(
        { admissionNo },
        {
          $set: {
            admissionNo: "",
            mrNo: "",
            reserved: false,
            party: "",
          },
        },
        { new: true }
      );
      res.status(200).json({ message: "Patient Discharged Successfully" });
    }
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

export default router;
