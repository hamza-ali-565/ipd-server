import { ApiError } from "../../utils/ApiError.mjs";
import { asyncHandler } from "../../utils/asyncHandler.mjs";
import { ApiResponse } from "../../utils/ApiResponse.mjs";
import { LabBookingModel } from "../../models/LAB.Models/LabBooking.model.mjs";
import { getCreatedOn } from "../../constants.mjs";
import { PatientRegModel } from "../../../DBRepo/IPD/PatientModel/PatientRegModel.mjs";
import { PaymentRecieptModel } from "../../../DBRepo/IPD/PaymenModels/PaymentRecieptModel.mjs";

// Creation of Lab Booking
const LabBookingCreator = asyncHandler(async (req, res) => {
  const {
    consultant,
    consultantId,
    party,
    partyId,
    mrNo,
    labFrom,
    labDetails,
    remarks,
    amount,
    paymentType,
    location,
    _id,
    shiftNo,
  } = req.body;
  console.log("REQ.BODY ", req.body);

  if (
    ![
      consultant,
      consultantId,
      party,
      partyId,
      mrNo,
      labFrom,
      shiftNo,
      labDetails,
      amount,
      paymentType,
      location,
    ].every(Boolean)
  )
    throw new ApiError(404, "ALL PARAMETERS ARE REQUIRED !!!");

  // update consultant and remarks
  const updateConsAndRem = async () => {
    const updation = await LabBookingModel.updateOne(
      { _id },
      {
        $set: {
          consultantId,
          consultant,
          remarks,
          updatedOn: getCreatedOn(),
          updatedUser: req?.user?.userId,
        },
      },
      {
        new: true,
      }
    );
    return updation;
  };

  // Patient Data
  const patient = await PatientRegModel.find({ MrNo: mrNo });

  // create new lab
  const creationOfNewLab = async () => {
    const creation = await LabBookingModel.create({
      consultant,
      consultantId,
      party,
      partyId,
      mrNo,
      labFrom,
      labDetails,
      shiftNo,
      remarks,
      createdUser: req?.user?.userId,
      paymentType,
      location,
      amount,
    });
    return creation;
  };

  //payment No
  const generatePayment = async (labNo, date) => {
    const payment = await PaymentRecieptModel.create({
      paymentType,
      location,
      paymentAgainst: "Lab Registration",
      amount,
      shiftNo,
      againstNo: labNo,
      mrNo,
      remarks,
      createdUser: req?.user?.userId,
      createdOn: date,
    });
    return payment;
  };
  let myCP;
  if (_id !== "") {
    myCP = await updateConsAndRem();
    return res
      ?.status(200)
      .json(
        new ApiResponse(200, { data: myCP }, "LAB UPDATED SUCCESSFULLY !!!")
      );
  } else {
    myCP = await creationOfNewLab();
    console.log("myCP", myCP);

    const paymentNo = await generatePayment(myCP.labNo, myCP.createdOn);
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          data: myCP.labDetails,
          data1: [paymentNo],
          data2: patient,
          doctor: myCP?.consultant,
        },
        "DATA CREATED SUCCESSFULLY"
      )
    );
  }
});

// Lab No(s) with patient name
const PrevLabs = asyncHandler(async (req, res) => {
  const { labFrom, where } = req?.query;
  console.log(where);

  let response;
  if (where === "") {
    response = await LabBookingModel.find({ isDeletedAll: false, labFrom });
  } else {
    response = await LabBookingModel.find({ isRemain: true, labFrom });
  }
  const carryMrNo = response.map((items) => items?.mrNo);
  const findPatient = await PatientRegModel.find({ MrNo: { $in: carryMrNo } });
  const mrNoToPatientNameMap = {};
  findPatient.forEach((patient) => {
    mrNoToPatientNameMap[patient?.MrNo] = {
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
  });

  const updatedResponse = response.map((item) => ({
    _id: item._id,
    mrNo: item.mrNo,
    labNo: item.labNo,
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

  return res.status(200).json(new ApiResponse(200, { data: updatedResponse }));
});

// for print booked lab
const singleLabPdfPrint = asyncHandler(async (req, res) => {
  const { labNo, mrNo } = req?.query;
  if (![labNo, mrNo].every(Boolean))
    throw new ApiError(400, "ALL PARAMETERS ARE REQUIRED !!!");
  const LabBooking = await LabBookingModel.find({ labNo, mrNo });
  // filterDeletedTest
  const filterTest = LabBooking[0].labDetails.filter(
    (items) => items?.isDeleted !== true
  );
  const patient = await PatientRegModel.find({ MrNo: mrNo });
  const paymentNo = await PaymentRecieptModel.find({
    againstNo: labNo,
    paymentAgainst: "Lab Registration",
  });

  res.status(200).json(
    new ApiResponse(200, {
      data: filterTest,
      data1: paymentNo,
      data2: patient,
      doctor: LabBooking[0]?.consultant,
    })
  );
});

// Lab deletion on behalf of uniqueId
const LabDeletion = asyncHandler(async (req, res) => {
  const { uniqueId } = req?.body;
  if (!uniqueId) throw new ApiError(404, "UNIQUE ID IS REQUIRED !!!");
  const updation = await LabBookingModel.findOneAndUpdate(
    { "labDetails.uniqueId": uniqueId },
    {
      $set: {
        "labDetails.$.isDeleted": true,
        "labDetails.$.isDeletedUser": req?.user?.userId,
        "labDetails.$.isDeletedOn": getCreatedOn(),
        isRemain: true,
      },
    },
    { new: true }
  );
  const checkAllDeletion = updation.labDetails.every(
    (items) => items?.isDeleted
  );

  if (checkAllDeletion === true) {
    const finalupdate = await LabBookingModel.updateOne(
      { "labDetails.uniqueId": uniqueId },
      { isDeletedAll: true }
    );
  }
  return res.status(200).json(200, { data: updation });
});

// refund Amount No
const refundAmount = asyncHandler(async (req, res) => {
  const { labNo } = req.query;
  if (!labNo) throw new ApiError(404, "LAB NO IS REQUIRED !!!");
  const data = await LabBookingModel.find({ labNo }).select("labDetails");
  let amount = 0;
  const filterData = data[0].labDetails.filter(
    (items) => items?.isDeleted !== false
  );
  const sum = filterData.map((items) => (amount += items?.amount));
  console.log("filter Data", filterData);
  
  return res.status(200).json(new ApiResponse(200, { data: amount }));
});

export {
  LabBookingCreator,
  PrevLabs,
  singleLabPdfPrint,
  LabDeletion,
  refundAmount,
};
