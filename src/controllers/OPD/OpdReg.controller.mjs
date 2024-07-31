import moment from "moment";
import { getCreatedOn, getCreatedOnDate } from "../../constants.mjs";
import { OPDRegModel } from "../../models/OPD.Models/OPDRegistration.model.mjs";
import { ApiError } from "../../utils/ApiError.mjs";
import { ApiResponse } from "../../utils/ApiResponse.mjs";
import { asyncHandler } from "../../utils/asyncHandler.mjs";
import { isAfter, isBefore } from "date-fns";
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
      compDate: await getCreatedOnDate()
    });
    return newTokenDoc;
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
      compDate: await getCreatedOnDate()
    });
    return newTokenDoc;
  };

  const lastDoc = await OPDRegModel.find({ consultantId })
    .sort({ tokenNo: -1 })
    .limit(1)
    .exec();
  if (lastDoc.length <= 0) {
    const newToken = await generateTodayToken();
    return res.status(200).json(new ApiResponse(200, { data: newToken }));
  }
  console.log("lastDoc", lastDoc);
  // const dateTime = moment(response[0].createdOn, 'DD/MM/YYYY HH:mm:ss').format('DD/MM/YYYY');
  // const day = moment(dateTime, 'DD/MM/YYYY').startOf('day')
  // console.log('date', day);
  const todayDate = await getCreatedOnDate();
  const lastDocDate = lastDoc[0]?.compDate;

  //   date1 = 31/10/2023 10:55:10
  // date2 = 30/10/2023 20:15:36

  const date1 = moment(todayDate, "DD/MM/YYYY");
  const date2 = moment(lastDocDate, "DD/MM/YYYY");

  console.log({ date1, date2 });

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

export { OPDRegistration };
