import { ApiError } from "../../utils/ApiError.mjs";
import { asyncHandler } from "../../utils/asyncHandler.mjs";
import { ApiResponse } from "../../utils/ApiResponse.mjs";
import { labTestModel } from "../../models/LAB.Models/test.model.mjs";

const labTest = asyncHandler(async (req, res) => {
  const {
    testName,
    department,
    category,
    testType,
    reportDays,
    active,
    style,
    testRanges,
  } = req.body;

  if (
    ![
      testName,
      department,
      category,
      testType,
      reportDays,
      active,
      style,
    ].every(Boolean)
  ) {
    throw new ApiError(400, "All fields are required");
  }

  let rangeInfo = [];
  if (testRanges.length > 0) {
    rangeInfo = testRanges.filter((items) => items.equipment !== "");
  }

  console.log("ranges", rangeInfo);

  const response = await labTestModel.create({
    testName,
    department,
    category,
    testType,
    reportDays,
    active,
    style,
    testRanges: rangeInfo,
    thisIs: "Test",
    createdUser: req?.user?.userId,
  });
  console.log("response of lab test ", response);

  return res
    .status(200)
    .json(
      new ApiResponse(200, { data: response }, "TEST CREATED SUCCESSFULLY !!!")
    );
});

// get test to show details on modal and update

const LabTestToUpdate = asyncHandler(async (req, res) => {
  const response = await labTestModel.find({});
  if (!response) throw new ApiError(402, "DATA NOT FOUND !!!");
  res.status(200).json(new ApiResponse(200, { data: response }));
});

export { labTest, LabTestToUpdate };
