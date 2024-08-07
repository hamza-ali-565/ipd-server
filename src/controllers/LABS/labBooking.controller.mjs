import { ApiError } from "../../utils/ApiError.mjs";
import { asyncHandler } from "../../utils/asyncHandler.mjs";
import { ApiResponse } from "../../utils/ApiResponse.mjs";
import { LabBookingModel } from "../../models/LAB.Models/LabBooking.model.mjs";
import { getCreatedOn } from "../../constants.mjs";

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
    });
    return creation;
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
    return res
      .status(200)
      .json(200, { data: myCP }, "DATA CREATED SUCCESSFULLY");
  }
});

export { LabBookingCreator };
