import moment from "moment";
import { getCreatedOn, getCreatedOnDate } from "../../constants.mjs";
import { OPDRegModel } from "../../models/OPD.Models/OPDRegistration.model.mjs";
import { ApiError } from "../../utils/ApiError.mjs";
import { ApiResponse } from "../../utils/ApiResponse.mjs";
import { asyncHandler } from "../../utils/asyncHandler.mjs";
import { PaymentRecieptModel } from "../../../DBRepo/IPD/PaymenModels/PaymentRecieptModel.mjs";
import { PatientRegModel } from "../../../DBRepo/IPD/PatientModel/PatientRegModel.mjs";
import { PaymentRefundModal } from "../../../DBRepo/IPD/PaymenModels/PaymentRefundModel.mjs";

// opd registration
const OPDRegistration = asyncHandler(async (req, res) => {
  const {
    mrNo,
    partyName,
    partyId,
    consultantName,
    consultantId,
    paymentType,
    location,
    remarks,
    shiftNo,
    amount,
  } = req.body;
  if (
    ![
      mrNo,
      partyName,
      partyId,
      consultantName,
      consultantId,
      paymentType,
      location,
      shiftNo,
      amount,
    ].every(Boolean)
  )
    throw new ApiError(402, "ALL PARAMETERS ARE REQUIRED !!!");
  const mrData = await PatientRegModel.find({ MrNo: mrNo });
  // payment No
  const generatePayment = async (opdNo, date) => {
    const payment = await PaymentRecieptModel.create({
      paymentType,
      location,
      paymentAgainst: "OPD Registration",
      amount,
      shiftNo,
      againstNo: opdNo,
      mrNo,
      remarks,
      createdUser: req?.user?.userId,
      createdOn: date,
    });
    return payment;
  };
  //   new Token
  const generateTodayToken = async () => {
    const newTokenDoc = await OPDRegModel.create({
      mrNo,
      partyName,
      partyId,
      consultantName,
      consultantId,
      paymentType,
      location,
      createdOn: getCreatedOn(),
      createdUser: req.user?.userId,
      remarks,
      amount,
      tokenNo: 1,
      shiftNo,
      compDate: getCreatedOnDate(),
    });
    const payment = await generatePayment(
      newTokenDoc?.opdNo,
      newTokenDoc?.createdOn
    );
    return { data: [newTokenDoc], data1: [payment] };
  };
  //   other token
  const generateOtherToken = async () => {
    const newTokenDoc = await OPDRegModel.create({
      mrNo,
      partyName,
      partyId,
      consultantName,
      consultantId,
      paymentType,
      location,
      createdOn: getCreatedOn(),
      createdUser: req.user?.userId,
      remarks,
      amount,
      tokenNo: lastDoc[0].tokenNo + 1,
      shiftNo,
      compDate: getCreatedOnDate(),
    });
    const payment = await generatePayment(
      newTokenDoc?.opdNo,
      newTokenDoc?.createdOn
    );
    return { data: [newTokenDoc], data1: [payment] };
  };

  const lastDoc = await OPDRegModel.find({ consultantId })
    .sort({ opdNo: -1 })
    .limit(1)
    .exec();
  if (lastDoc.length <= 0) {
    const newToken = await generateTodayToken();
    return res.status(200).json(new ApiResponse(200, { data: newToken }));
  }

  const todayDate = getCreatedOnDate();
  const lastDocDate = lastDoc[0]?.compDate;

  console.log("today ", todayDate);
  console.log("last doc ", lastDocDate);
  //   date1 = 31/10/2023
  // date2 = 30/10/2023

  const date1 = moment(todayDate, "DD/MM/YYYY");
  const date2 = moment(lastDocDate, "DD/MM/YYYY");

  if (date1.isAfter(date2)) {
    const newToken = await generateTodayToken();
    return res.status(200).json(
      new ApiResponse(200, {
        data: newToken?.data,
        data1: newToken?.data1,
        data2: mrData,
      })
    );
  } else if (date1.isBefore(date2)) {
    const newToken = await generateTodayToken();
    return res.status(200).json(
      new ApiResponse(200, {
        data: newToken?.data,
        data1: newToken?.data1,
        data2: mrData,
      })
    );
  } else {
    const newToken = await generateOtherToken();
    return res.status(200).json(
      new ApiResponse(200, {
        data: newToken?.data,
        data1: newToken?.data1,
        data2: mrData,
      })
    );
  }
});

const OPDToken = asyncHandler(async (req, res) => {
  const { consultantId } = req?.query;
  if (!consultantId) throw new ApiError(401, "CONSULTANT ID IS REUIRED !!!");
  const lastToken = await OPDRegModel.find({
    consultantId,
    compDate: await getCreatedOnDate(),
  })
    .sort({ tokenNo: -1 })
    .limit(1)
    .exec();
  if (lastToken.length <= 0) {
    return res.status(200).json(new ApiResponse(200, { data: { tokenNo: 1 } }));
  } else {
    const lastTokenNo = lastToken[0].tokenNo;
    return res
      .status(200)
      .json(new ApiResponse(200, { data: { tokenNo: lastTokenNo + 1 } }));
  }
});

// get opd reg for madal view

const registeredOPD = asyncHandler(async (_, res) => {
  const response = await OPDRegModel.find({
    isDeleted: false,
  });
  if (response.length < 0) throw new ApiError(400, "NO DATA FOUND !!!");
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
    opdNo: item.opdNo,
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
  res
    .status(200)
    .json(new ApiResponse(200, { data: updatedResponse }, "DATA RECEIVED "));
});

// get radiology for print PDF

const OPDToPrint = asyncHandler(async (req, res) => {
  const { opdNo, mrNo, message } = req.query;
  if (!opdNo || !mrNo) throw new ApiError(402, "OPD/MR-No NO IS REQUIRED !!!");
  const OPDdata = await OPDRegModel.find({ opdNo });
  const paymentdata = await PaymentRecieptModel.find({
    againstNo: opdNo,
  });
  const patientData = await PatientRegModel.find({ MrNo: mrNo });
  if (message) {
    return res.status(200).json(
      new ApiResponse(200, {
        data: OPDdata,
      })
    );
  }
  res.status(200).json(
    new ApiResponse(200, {
      data: OPDdata,
      data1: paymentdata,
      data2: patientData,
    })
  );
});

// update Many
const updateIsDelete = asyncHandler(async (req, res) => {
  const updateMani = await OPDRegModel.updateMany({}, { isDeleted: false });
  res.status(200).json(new ApiResponse(200, { updateMani }, "data updates"));
});

// opd refund
const OPDRefund = asyncHandler(async (req, res) => {
  const {
    refundAgainst,
    refundType,
    location,
    refundAmount,
    shiftNo,
    againstNo,
    mrNo,
    remarks,
  } = req.body;
  if (
    ![
      refundAgainst,
      refundType,
      location,
      refundAmount,
      shiftNo,
      againstNo,
      mrNo,
    ].every(Boolean)
  )
    throw new ApiError(402, "ALL PARAMETERS ARE REQUIRED !!!");

  const updateOpdDoc = await OPDRegModel.findOneAndUpdate(
    { opdNo: againstNo, mrNo },
    {
      $set: {
        isDeleted: true,
        deletedUser: req?.user?.userId,
        deletedOn: getCreatedOn(),
      },
    },
    { new: true }
  );
  if (!updateOpdDoc) throw new ApiError(404, "ERROR PLEASE TRY LATER !!!");
  const createRefundNo = await PaymentRefundModal.create({
    refundAgainst,
    refundType,
    location,
    refundAmount,
    shiftNo,
    againstNo,
    mrNo,
    remarks,
    createdUser: req?.user?.userId,
    createdOn: updateOpdDoc?.deletedOn,
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

  return res.status(200).json(new ApiResponse(200, { data: updatedResponse }));
});

export {
  OPDRegistration,
  OPDToken,
  registeredOPD,
  updateIsDelete,
  OPDToPrint,
  OPDRefund,
};
