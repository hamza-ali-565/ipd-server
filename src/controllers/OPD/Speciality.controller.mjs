import { ApiError } from "../../utils/ApiError.mjs";
import { asyncHandler } from "../../utils/asyncHandler.mjs";
import { ApiResponse } from "../../utils/ApiResponse.mjs";
import { ConsultantsModel } from "../../../DBRepo/General/ConsultantModel/ConsultantModel.mjs";

const ConsultantSchedule = asyncHandler(async (req, res) => {
  const { speciality, specialityId } = req.query;
  console.log("req.query", req.query);
  if (![speciality, specialityId].every(Boolean))
    throw new ApiError(
      401,
      "BOTH FIELDS i.e  SPECIALITY AND SPECIALITY ID IS REQUIRED !!!"
    );

  const findDRS = await ConsultantsModel.find({
    speciality,
    specialityId,
  }).select("name  speciality days timing");

  if (findDRS <= 0) throw new ApiError(402, "DATA NOT FOUND !!!");

  res
    .status(200)
    .json(
      new ApiResponse(200, { data: findDRS }, "DATA FOUND SUCCESSFULLY !!!")
    );
});


export {ConsultantSchedule}