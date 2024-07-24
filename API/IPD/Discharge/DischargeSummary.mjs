import express from "express";
import { ConsultantsModel } from "../../../DBRepo/General/ConsultantModel/ConsultantModel.mjs";
import {
  AdmissionConsultantModel,
  AdmissionPartyModel,
  AdmissionWardModel,
} from "../../../DBRepo/IPD/PatientModel/AdmissionDetails/PartyModel.mjs";
import { DischargeSummaryModel } from "../../../DBRepo/IPD/Discharge/DischargeSummaryModel.mjs";
import moment from "moment-timezone";
import { AdmissionModel } from "../../../DBRepo/IPD/PatientModel/AdmissionDetails/AdmissionModel.mjs";

const router = express.Router();

router.post("/ipddischargeSummary", async (req, res) => {
  try {
    const {
      mrNo,
      admissionNo,
      createUser,
      dischargeCondition,
      dischargeDoctor,
      dischargeSummaryData,
    } = req.body;
    if (
      ![
        mrNo,
        admissionNo,
        createUser,
        dischargeCondition,
        dischargeDoctor,
        dischargeSummaryData,
      ].every(Boolean)
    )
      throw new Error("ALL PARAMETERS ARE RREQUIRED !!!");

    if (dischargeSummaryData.length <= 0)
      throw new Error("PLEASE FILL SOME DETAILS IN DISCHARGE SUMMARY !!!");

    const summaryCheck = await DischargeSummaryModel.find({ admissionNo });
    if (summaryCheck.length > 0) {
      console.log("req.body", req.body);
      const updateData = await DischargeSummaryModel.findOneAndUpdate(
        { admissionNo },
        {
          mrNo,
          admissionNo,
          createUser,
          dischargeCondition,
          dischargeDoctor,
          dischargeSummaryData,
          createdOn: moment(new Date())
            .tz("Asia/Karachi")
            .format("DD/MM/YYYY HH:mm:ss"),
        },
        { new: true }
      );
      res.status(200).send({ message: "Data updated Successfully" });
      return;
    }

    const response = await DischargeSummaryModel.create({
      mrNo,
      admissionNo,
      createUser,
      dischargeCondition,
      dischargeDoctor,
      dischargeSummaryData,
      createdOn: moment(new Date())
        .tz("Asia/Karachi")
        .format("DD/MM/YYYY HH:mm:ss"),
    });
    const updateAdmission = await AdmissionModel.findOneAndUpdate(
      { admissionNo },
      { discgargeSummaryDate: response[0]?.createdOn, dischargeSummary: true },
      { new: true }
    );
    res.status(200).json(response);
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

router.get("/dischargeconsultant", async (req, res) => {
  try {
    const { admissionNo, returnTo } = req.query;
    if (!admissionNo) throw new Error("ADMISSOIN NO IS REQUIRED !!!");
    const activeConsultant = await AdmissionConsultantModel.find({
      admissionNo,
      activeOnAdmission: true,
    });
    const ConsultantName = await ConsultantsModel.find({
      _id: activeConsultant[0]?.consultantId,
    });
    const party = await AdmissionPartyModel.find({
      admissionNo,
      activeOnAdmission: true,
    });
    const updatedData = ConsultantName.map((item) => ({
      name: item?.name,
      _id: item?._id,
      party: party[0]?.party,
    }));
    const ward = await AdmissionWardModel.find({
      admissionNo,
      activeOnAdmission: true,
    });
    if (returnTo === "Chalo Bhai") {
      res.status(200).json({ data: updatedData, data2: ward });
      return;
    }
    const admission = await AdmissionModel.find({
      admissionNo,
      dischargeSummary: true,
    });
    let disSummary;
    if (admission.length > 0) {
      disSummary = await DischargeSummaryModel.find({ admissionNo });
    }
    res.status(200).json({ data: updatedData, data2: disSummary, data3: ward });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
