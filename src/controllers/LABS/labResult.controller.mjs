import { asyncHandler } from "../../utils/asyncHandler.mjs";
import { ApiError } from "../../utils/ApiError.mjs";
import { ApiResponse } from "../../utils/ApiResponse.mjs";
import { labResultModel } from "../../models/LAB.Models/labResult.model.mjs";
import { LabChargesModel } from "../../models/LAB.Models/labCharges.model.mjs";
import { LabBookingModel } from "../../models/LAB.Models/LabBooking.model.mjs";

// post result of biochemistry
const labResult = asyncHandler(async (req, res) => {
  const { mrNo, labNo, resultDepart, resultData, testId } = req.body;
  console.log("req.body", req.body);

  if (![mrNo, labNo, resultDepart, resultData, testId].every(Boolean))
    throw new ApiError(401, "ALL PARAMETERS ARE REQUIRED !!!");
  if (resultData.length <= 0)
    throw new ApiError(402, "DATA REQUIRED IN TEST RESULT ARRAY !!!");
  const result = await labResultModel.create({
    mrNo,
    labNo,
    createdUser: req?.user?.userId,
    resultDepart,
    resultData,
  });

  const updateTestModel = await LabBookingModel.findOneAndUpdate(
    {
      labNo,
      "labDetails.testId": testId,
    },
    {
      "labDetails.$.resultEntry": true,
    },
    { new: true }
  );
  return res.status(200).json(new ApiResponse(200, { data: result }));
});

export { labResult };
