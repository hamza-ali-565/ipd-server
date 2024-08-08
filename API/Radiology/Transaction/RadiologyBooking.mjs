import express, { response } from "express";
import { RadiologyBookingModel } from "../../../DBRepo/Radiology/Transaction/RadiologyBookingModel.mjs";
import { PaymentRecieptModel } from "../../../DBRepo/IPD/PaymenModels/PaymentRecieptModel.mjs";
import { PatientRegModel } from "../../../DBRepo/IPD/PatientModel/PatientRegModel.mjs";
import moment from "moment-timezone";
import { resetCounter } from "../../General/ResetCounter/ResetCounter.mjs";
import { AdmissionModel } from "../../../DBRepo/IPD/PatientModel/AdmissionDetails/AdmissionModel.mjs";
import { PaymentRefundModal } from "../../../DBRepo/IPD/PaymenModels/PaymentRefundModel.mjs";
import { getCreatedOn } from "../../../src/constants.mjs";

const router = express.Router();

router.post("/radiologybooking", async (req, res) => {
  try {
    const {
      mrNo,
      consultant,
      party,
      remarks,
      amount,
      paymentType,
      location,
      serviceDetails,
      createdUser,
      shiftNo,
    } = req.body;

    if (
      ![
        mrNo,
        consultant,
        party,
        amount,
        paymentType,
        location,
        serviceDetails,
        createdUser,
        shiftNo,
      ].every(Boolean)
    )
      throw new Error("ALL PARAMETERS ARE REQUIRED!!!");
    const response = await RadiologyBookingModel.create({
      mrNo,
      consultant,
      party,
      remarks,
      amount,
      paymentType,
      location,
      serviceDetails,
      shiftNo,
      createdUser,
      createdOn: moment(new Date())
        .tz("Asia/Karachi")
        .format("DD/MM/YYYY HH:mm:ss"),
      patientType: "Cash",
    });

    const payment = await PaymentRecieptModel.create({
      paymentType,
      location,
      paymentAgainst: "Radiology Bookinhg",
      amount,
      shiftNo,
      againstNo: response?.radiologyNo,
      mrNo,
      remarks,
      createdUser,
      createdOn: response?.createdOn,
    });
    const patientData = await PatientRegModel.find({ MrNo: mrNo });
    res.status(200).json({
      data: response?.serviceDetails,
      data1: [payment],
      data2: patientData,
      doctor: response?.consultant,
    });
  } catch (error) {
    res.status(400).send({ message: error.message, body: req.body });
  }
});

router.get("/radiologypdf", async (req, res) => {
  try {
    const { radiologyNo, mrNo } = req.query;
    if (!radiologyNo || !mrNo)
      throw new Error("RADIOLOGY/MR-No NO IS REQUIRED !!!");
    const Radiodata = await RadiologyBookingModel.find({ radiologyNo });
    const updateRadioData = Radiodata[0]?.serviceDetails.filter(
      (items) => items?.isDeleted !== true
    );
    const paymentdata = await PaymentRecieptModel.find({
      againstNo: radiologyNo,
    })
      .sort({ _id: -1 })
      .limit(1);
    const patientData = await PatientRegModel.find({ MrNo: mrNo });
    res.status(200).send({
      data: updateRadioData,
      data1: paymentdata,
      data2: patientData,
      doctor: Radiodata[0]?.consultant,
    });
  } catch (error) {                                     
    res.status(400).send({ message: error.message });
  }
});


router.get("/radiologybooking", async (req, res) => {
  try {
    const { radiologyNo } = req.query;
    if (![radiologyNo].every(Boolean))
      throw new Error("ALL PARAMETERS ARE REQUIRED !!!");
    const response = await RadiologyBookingModel.find({ radiologyNo });

    if (response.length <= 0)
      throw new Error("NO SERVICES ADDED TO THIS PATIENT!!!");
    const flatData = response.flatMap((item) => item?.serviceDetails);
    const updatedData = flatData.filter((items) => items?.isDeleted !== true);
    res.status(200).send({ data: updatedData });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});


router.get("/radiologybookingNew", async (req, res) => {
  try {
    const { admissionNo } = req.query;
    if (![admissionNo].every(Boolean))
      throw new Error("ALL PARAMETERS ARE REQUIRED !!!");
    const response = await RadiologyBookingModel.find({ admissionNo });

    if (response.length <= 0)
      throw new Error("NO SERVICES ADDED TO THIS PATIENT!!!");
    const flatData = response.flatMap((item) => item?.serviceDetails);
    const updatedData = flatData.filter((items) => items?.isDeleted !== true);
    res.status(200).send({ data: updatedData });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

router.get("/radiologyreverse", async (req, res) => {
  try {
    const { radiologyNo } = req.query;
    if (![radiologyNo].every(Boolean))
      throw new Error("ALL PARAMETERS ARE REQUIRED !!!");
    const response = await RadiologyBookingModel.find({ radiologyNo });

    if (response.length <= 0)
      throw new Error("NO SERVICES ADDED TO THIS PATIENT!!!");
    const flatData = response.flatMap((item) => item?.serviceDetails);
    const updatedData = flatData.filter(
      (items) => items?.isDeleted !== false && items?.refund !== true
    );
    res.status(200).send({ data: updatedData });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

router.put("/radiologybooking", async (req, res) => {
  try {
    const { uniqueId, deletedUser } = req.body;
    if (![uniqueId, deletedUser].every(Boolean))
      throw new Error("ALL PARAMETERS ARE REQUIRED !!!");
    const response = await RadiologyBookingModel.updateOne(
      { "serviceDetails.uniqueId": uniqueId },
      {
        $set: {
          "serviceDetails.$.isDeleted": true,
          "serviceDetails.$.deletedUser": deletedUser,
          "serviceDetails.$.deletedOn": moment(new Date())
            .tz("Asia/Karachi")
            .format("DD/MM/YYYY HH:mm:ss"),
          isRemain: true,
        },
      }
    );
    const update = await RadiologyBookingModel.find({
      "serviceDetails.uniqueId": uniqueId,
    });
    const checkData = update[0].serviceDetails.every(
      (items) => items?.isDeleted
    );
    if (checkData === true) {
      const finalupdate = await RadiologyBookingModel.updateOne(
        { "serviceDetails.uniqueId": uniqueId },
        { isDeletedAll: true }
      );
      res.status(200).send({ message: "Deleted Successfully" });
      return;
    }
    res.status(200).send({ Data: "Deleted Successfully" });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

router.get("/radiologydetails", async (req, res) => {
  try {
    const { patientType } = req.query;
    const response = await RadiologyBookingModel.find({
      isDeletedAll: false,
      patientType,
    });
    if (response.length < 0) throw new Error("NO DATA FOUND !!!");
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
      };
      return acc;
    }, {});

    // Step 4: Add patientName to the original response
    const updatedResponse = response.map((item) => ({
      _id: item._id,
      mrNo: item.mrNo,
      radiologyNo: item.radiologyNo,
      patientName: mrNoToPatientNameMap[item.mrNo]?.patientName,
      patientType: mrNoToPatientNameMap[item.mrNo]?.patientType,
      relativeType: mrNoToPatientNameMap[item.mrNo]?.relativeType,
      relativeName: mrNoToPatientNameMap[item.mrNo]?.relativeName,
      ageYear: mrNoToPatientNameMap[item.mrNo]?.ageYear,
      ageMonth: mrNoToPatientNameMap[item.mrNo]?.ageMonth,
      ageDay: mrNoToPatientNameMap[item.mrNo]?.ageDay,
      cellNo: mrNoToPatientNameMap[item.mrNo]?.cellNo,
      gender: mrNoToPatientNameMap[item.mrNo]?.gender,
    }));
    res.status(200).send({ data: updatedResponse });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

router.get("/radiologydetailsforrefund", async (req, res) => {
  try {
    const response = await RadiologyBookingModel.find({
      isRemain: true,
      patientType: "Cash",
    });
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
      };
      return acc;
    }, {});

    // Step 4: Add patientName to the original response
    const updatedResponse = response.map((item) => ({
      _id: item._id,
      mrNo: item.mrNo,
      radiologyNo: item.radiologyNo,
      patientName: mrNoToPatientNameMap[item.mrNo]?.patientName,
      patientType: mrNoToPatientNameMap[item.mrNo]?.patientType,
      relativeType: mrNoToPatientNameMap[item.mrNo]?.relativeType,
      relativeName: mrNoToPatientNameMap[item.mrNo]?.relativeName,
      ageYear: mrNoToPatientNameMap[item.mrNo]?.ageYear,
      ageMonth: mrNoToPatientNameMap[item.mrNo]?.ageMonth,
      ageDay: mrNoToPatientNameMap[item.mrNo]?.ageDay,
      cellNo: mrNoToPatientNameMap[item.mrNo]?.cellNo,
      gender: mrNoToPatientNameMap[item.mrNo]?.gender,
    }));
    res.status(200).send({ data: updatedResponse });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

router.delete("/deleteCollectionRadiology", async (req, res) => {
  try {
    const response = await RadiologyBookingModel.collection.drop();
    resetCounter("radiologyNo");

    res.status(200).send({ data: response });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

router.put("/manyupdatesradio", async (req, res) => {
  try {
    const response = await RadiologyBookingModel.updateMany(
      {},
      { isDeletedAll: false }
    );
    res.status(200).send({ data: response });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

router.put("/paymentrefundradiology", async (req, res) => {
  try {
    const {
      uniqueId,
      refundUser,
      refundAgainst,
      refundType,
      location,
      refundAmount,
      shiftNo,
      againstNo,
      mrNo,
      remarks,
      createdUser,
    } = req.body;
    if (uniqueId.length <= 0) throw new Error("UNIQUE ID IS REQUIRED !!!");
    const response = await RadiologyBookingModel.updateMany(
      { "serviceDetails.uniqueId": { $in: uniqueId } },
      {
        $set: {
          "serviceDetails.$[elem].refund": true,
          "serviceDetails.$[elem].refundUser": refundUser,
          "serviceDetails.$[elem].refundOn": moment(new Date())
            .tz("Asia/Karachi")
            .format("DD/MM/YYYY HH:mm:ss"),
          isRemain: false,
        },
      },
      {
        arrayFilters: [{ "elem.uniqueId": { $in: uniqueId } }],
      }
    );
    const createRefundNo = await PaymentRefundModal.create({
      refundAgainst,
      refundType,
      location,
      refundAmount,
      shiftNo,
      againstNo,
      mrNo,
      remarks,
      createdUser: refundUser,
      createdOn: moment(new Date())
        .tz("Asia/Karachi")
        .format("DD/MM/YYYY HH:mm:ss"),
    });

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
      _id: createRefundNo._id,
      mrNo: createRefundNo.mrNo,
      againstNo: createRefundNo.againstNo,
      amount: createRefundNo.refundAmount,
      createdUser: createRefundNo.createdUser,
      createdOn: createRefundNo.createdOn,
      location: createRefundNo.location,
      paymentAgainst: createRefundNo.refundAgainst,
      paymentType: createRefundNo.refundType,
      remarks: createRefundNo.remarks,
      shiftNo: createRefundNo.shiftNo,
      paymentNo: createRefundNo.refundNo,
      ...patientInfo,
    };

    res.status(200).send({ data: updatedResponse });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

router.post("/ipdradiology", async (req, res) => {
  try {
    const { admissionNo, serviceDetails } = req.body;

    const mrInfo = await AdmissionModel.find({ admissionNo });
    const mrNo = mrInfo[0]?.mrNo;

    if (![admissionNo, mrNo, serviceDetails].every(Boolean))
      throw new Error("ALL PARAMETERS ARE REQUIRED!!!");
    if (serviceDetails.length <= 0) throw new Error("SERVICES ARE MISSING !!!");
    const dateWiseService = serviceDetails?.map((items) => ({
      serviceName: items?.serviceName,
      charges: items?.charges,
      status: items?.status,
      serviceId: items?.serviceId,
      _id: items?._id,
      amount: items?.amount,
      quantity: items?.quantity,
      createdUser: items?.createdUser,
      consultant: items?.consultant,
      createdOn: getCreatedOn(),
    }));
    console.log("service Details", dateWiseService);
    const response = await RadiologyBookingModel.create({
      admissionNo,
      mrNo,
      serviceDetails: dateWiseService,
      createdOn: moment(new Date())
        .tz("Asia/Karachi")
        .format("DD/MM/YYYY HH:mm:ss"),
      patientType: "IPD",
      party: "Cash",
    });

    res.status(200).send({ data: response });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

export default router;
