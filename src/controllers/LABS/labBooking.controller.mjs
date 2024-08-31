import { ApiError } from "../../utils/ApiError.mjs";
import { asyncHandler } from "../../utils/asyncHandler.mjs";
import { ApiResponse } from "../../utils/ApiResponse.mjs";
import { LabBookingModel } from "../../models/LAB.Models/LabBooking.model.mjs";
import { getCreatedOn } from "../../constants.mjs";
import { PatientRegModel } from "../../../DBRepo/IPD/PatientModel/PatientRegModel.mjs";
import { PaymentRecieptModel } from "../../../DBRepo/IPD/PaymenModels/PaymentRecieptModel.mjs";
import { PaymentRefundModal } from "../../../DBRepo/IPD/PaymenModels/PaymentRefundModel.mjs";
import { labTestModel } from "../../models/LAB.Models/test.model.mjs";

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

  return res
    .status(200)
    .json(new ApiResponse(200, { data: amount, filterData }));
});

//const refundCreation
const refundCreation = asyncHandler(async (req, res) => {
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
  } = req.body;
  console.log("BODY", req?.body);

  if (
    ![
      uniqueId,
      refundAgainst,
      refundType,
      location,
      refundAmount,
      shiftNo,
      againstNo,
      mrNo,
    ].every(Boolean)
  )
    throw new ApiError(401, "ALL PARAMETERS ARE REQUIRED !!!");
  if (uniqueId.length <= 0) throw new ApiError(401, "NOTHING TO REFUND !!!");
  // creation of refund No
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
    createdOn: getCreatedOn(),
  });
  // update lab booking doc
  const updateDoc = await LabBookingModel.updateMany(
    {
      "labDetails.uniqueId": { $in: uniqueId },
    },
    {
      $set: {
        "labDetails.$[elem].isRefund": true,
        "labDetails.$[elem].isRefundOn": getCreatedOn(),
        "labDetails.$[elem].isRefundUser": req.user?.userId,
        isRemain: false,
      },
    },
    {
      arrayFilters: [{ "elem.uniqueId": { $in: uniqueId } }],
    }
  );
  //patient Data
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
  //response
  return res.status(200).json(new ApiResponse(200, { data: updatedResponse }));
});

// getting test for biochemistry
const BiochemistryTests = asyncHandler(async (req, res) => {
  const { labNo, department } = req.query;
  if (!labNo || !department) throw new ApiError(401, "LAB NO IS REQUIRED !!!");
  console.log("department ", department);

  // get registered lab
  const labData = await LabBookingModel.find({ labNo });

  if (labData?.length <= 0) {
    throw new ApiError(402, "NO DATA FOUND AGAINST THIS LAB NO.");
  }

  // filter Deleted Tests
  const filterlabDetails = labData[0].labDetails.filter(
    (items) => items?.isDeleted !== true
  );
  if (filterlabDetails.length <= 0)
    throw new ApiError(403, "ALL TESTS ARE DELETED !!!");

  // filter tests whose result already enntered
  const filterResutledLabs = labData[0].labDetails.filter(
    (items) => items?.resultEntry !== true
  );

  if (filterResutledLabs.length <= 0)
    throw new ApiError(401, "ALL RESULTS ARE ENTERED !!!");

  // extract undeleted ids
  let ids = filterResutledLabs.map((items) => items?.testId);

  // find test / group details of undeleted ids
  const BioIds = await labTestModel.find({ _id: { $in: ids } });
  const filterBioTests = BioIds.filter(
    (items) => items?.department === department
  );

console.log("BIO IDS ", BioIds);


  if (filterBioTests.length <= 0) {
    throw new ApiError(400, `NO TEST FOR BIOCHEMISTRY !!!`);
  }

  // Patient Data
  const patientData = await PatientRegModel.find({ MrNo: labData[0]?.mrNo });

  console.log("Bio Ids", filterBioTests);
  res.status(200).json(
    new ApiResponse(200, {
      patientData,
      labData: filterBioTests,
      labCDetails: labData,
    })
  );
});

//exports
export {
  LabBookingCreator,
  PrevLabs,
  singleLabPdfPrint,
  LabDeletion,
  refundAmount,
  refundCreation,
  BiochemistryTests,
};
