import express from "express";
import moment from "moment-timezone";
import { PaymentRefundModal } from "../../../DBRepo/IPD/PaymenModels/PaymentRefundModel.mjs";
import { FinalBillModel } from "../../../DBRepo/IPD/Discharge/FinalBillModel.mjs";
import { PatientRegModel } from "../../../DBRepo/IPD/PatientModel/PatientRegModel.mjs";
const router = express.Router();

router.post("/paymentrefund", async (req, res) => {
  try {
    const {
      refundType,
      location,
      refundAgainst,
      refundAmount,
      shiftNo,
      againstNo,
      mrNo,
      remarks,
      createdUser,
    } = req.body;
    if (
      ![
        refundType,
        location,
        refundAgainst,
        refundAmount,
        shiftNo,
        againstNo,
        mrNo,
        createdUser,
      ].every(Boolean)
    )
      throw new Error("ALL PARAMETERS ARE REQUIRED !!!");
    const response = await PaymentRefundModal.create({
      refundType,
      location,
      refundAgainst,
      refundAmount,
      shiftNo,
      againstNo,
      mrNo,
      remarks,
      createdUser,
      createdOn: moment(new Date())
        .tz("Asia/Karachi")
        .format("DD/MM/YYYY HH:mm:ss"),
    });
    if (refundAgainst === "Agaisnt IPD Bill") {
      const updateIPDBill = await FinalBillModel.findOneAndUpdate(
        { billNo: againstNo },
        { $set: { isRefund: true } },
        { new: true }
      );
    }
    const patientDetails = await PatientRegModel.find({ MrNo: mrNo });

    const mrNoToPatientNameMap = patientDetails.reduce((acc, patient) => {
      acc[patient?.MrNo] = {
        patientName: patient?.patientName,
        patientType: patient?.patientType,
        relativeType: patient?.relativeType,
        relativeName: patient?.relativeName,
        ageYear: patient?.ageYear,
        ageMonth: patient?.ageMonth,
        ageDay: patient?.ageDay,
        gender: patient?.gender,
        cellNo: patient?.cellNo,
        address: patient?.address,
      };
      return acc;
    }, {});

    const patientInfo = mrNoToPatientNameMap[mrNo] || {};

    const updatedResponse = {
      _id: response._id,
      mrNo: response.mrNo,
      againstNo: response.againstNo,
      amount: response.refundAmount,
      createdUser: response.createdUser,
      createdOn: response.createdOn,
      location: response.location,
      paymentAgainst: response.refundAgainst,
      paymentType: response.refundType,
      remarks: response.remarks,
      shiftNo: response.shiftNo,
      paymentNo: response.refundNo,
      ...patientInfo,
    };

    res.status(200).send({ data: updatedResponse });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

router.get("/paymentrefund", async (req, res) => {
  try {
    const response = await PaymentRefundModal.find({});
    const mrNos = response.map((item) => item.mrNo);
    const patientDetails = await PatientRegModel.find({ MrNo: { $in: mrNos } });
    const mrNoToPatientNameMap = patientDetails.reduce((acc, patient) => {
      acc[patient?.MrNo] = {
        patientName: patient?.patientName,
        patientType: patient?.patientType,
        relativeType: patient?.relativeType,
        relativeName: patient?.relativeName,
        ageYear: patient?.ageYear,
        ageMonth: patient?.ageMonth,
        ageDay: patient?.ageDay,
        gender: patient?.gender,
        cellNo: patient?.cellNo,
        address: patient?.address,
      };
      return acc;
    }, {});

    // Step 4: Add patientName to the original response
    const updatedResponse = response.map((item) => ({
      _id: item._id,
      mrNo: item.mrNo,
      againstNo: item.againstNo,
      amount: item.refundAmount,
      createdUser: item.createdUser,
      createdOn: item.createdOn,
      location: item.location,
      paymentAgainst: item.refundAgainst,
      paymentType: item.refundType,
      remarks: item.remarks,
      shiftNo: item.shiftNo,
      paymentNo: item.refundNo,
      patientName: mrNoToPatientNameMap[item.mrNo]?.patientName,
      patientType: mrNoToPatientNameMap[item.mrNo]?.patientType,
      relativeType: mrNoToPatientNameMap[item.mrNo]?.relativeType,
      relativeName: mrNoToPatientNameMap[item.mrNo]?.relativeName,
      ageYear: mrNoToPatientNameMap[item.mrNo]?.ageYear,
      ageMonth: mrNoToPatientNameMap[item.mrNo]?.ageMonth,
      ageDay: mrNoToPatientNameMap[item.mrNo]?.ageDay,
      cellNo: mrNoToPatientNameMap[item.mrNo]?.cellNo,
      gender: mrNoToPatientNameMap[item.mrNo]?.gender,
      address: mrNoToPatientNameMap[item.mrNo]?.address,
    }));
    res.status(200).send({ data: updatedResponse });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

export default router;
