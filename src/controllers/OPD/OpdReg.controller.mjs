import moment from "moment";
import { getCreatedOn, getCreatedOnDate } from "../../constants.mjs";
import { OPDRegModel } from "../../models/OPD.Models/OPDRegistration.model.mjs";
import { ApiError } from "../../utils/ApiError.mjs";
import { ApiResponse } from "../../utils/ApiResponse.mjs";
import { asyncHandler } from "../../utils/asyncHandler.mjs";
import { PaymentRecieptModel } from "../../../DBRepo/IPD/PaymenModels/PaymentRecieptModel.mjs";
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
      createdOn: await getCreatedOn(),
      createdUser: req.user?.userId,
      remarks,
      amount,
      tokenNo: 1,
      shiftNo,
      compDate: await getCreatedOnDate(),
    });
    const payment = await generatePayment(
      newTokenDoc?.opdNo,
      newTokenDoc?.createdOn
    );
    return { newTokenDoc, payment };
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
      createdOn: await getCreatedOn(),
      createdUser: req.user?.userId,
      remarks,
      amount,
      tokenNo: lastDoc[0].tokenNo + 1,
      shiftNo,
      compDate: await getCreatedOnDate(),
    });
    const payment = await generatePayment(
      newTokenDoc?.opdNo,
      newTokenDoc?.createdOn
    );
    return { newTokenDoc, payment };
  };
  console.log(generateOtherToken, generateTodayToken);
  const lastDoc = await OPDRegModel.find({ consultantId })
    .sort({ tokenNo: -1 })
    .limit(1)
    .exec();
  if (lastDoc.length <= 0) {
    const newToken = await generateTodayToken();
    return res.status(200).json(new ApiResponse(200, { data: newToken }));
  }
  console.log("lastDoc", lastDoc);

  const todayDate = await getCreatedOnDate();
  const lastDocDate = lastDoc[0]?.compDate;

  //   date1 = 31/10/2023
  // date2 = 30/10/2023

  const date1 = moment(todayDate, "DD/MM/YYYY");
  const date2 = moment(lastDocDate, "DD/MM/YYYY");

  if (date1.isAfter(date2)) {
    const newToken = await generateTodayToken();
    return res.status(200).json(new ApiResponse(200, { data: newToken }));
  } else if (date1.isBefore(date2)) {
    const newToken = await generateTodayToken();
    return res.status(200).json(new ApiResponse(200, { data: newToken }));
  } else {
    const newToken = await generateOtherToken();
    return res.status(200).json(new ApiResponse(200, { data: newToken }));
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

export { OPDRegistration, OPDToken };
