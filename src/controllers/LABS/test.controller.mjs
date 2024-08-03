import { ApiError } from "../../utils/ApiError.mjs";
import { asyncHandler } from "../../utils/asyncHandler.mjs";
import { ApiResponse } from "../../utils/ApiResponse.mjs";
import { labTestModel } from "../../models/LAB.Models/test.model.mjs";
import { getCreatedOn } from "../../constants.mjs";

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
    _id,
  } = req.body;

  if (
    ![testName, department, category, testType, reportDays, style].every(
      Boolean
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  let rangeInfo = [];
  if (testRanges.length > 0) {
    rangeInfo = testRanges.filter((items) => items.equipment !== "");
  }

  console.log(" Equip", rangeInfo);

  // create lab
  const createTest = async () => {
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
    return response;
  };

  // Update Lab
  const updateTest = async (_id) => {
    const response = await labTestModel.findByIdAndUpdate(
      { _id },
      {
        $set: {
          testName,
          department,
          category,
          testType,
          reportDays,
          active,
          style,
          testRanges: rangeInfo,
          thisIs: "Test",
          updatedUser: req?.user?.userId,
          updatedOn: getCreatedOn(),
        },
      },
      { new: true }
    );
    return response;
  };

  if (!_id) {
    const createData = await createTest(_id);
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { data: createData },
          "TEST CREATED SUCCESSFULLY !!!"
        )
      );
  } else {
    const updateData = await updateTest(_id);
    return res
      .status(202)
      .json(
        new ApiResponse(
          202,
          { data: updateData },
          "TEST Updated SUCCESSFULLY !!!"
        )
      );
  }
});

// get test to show details on modal and update

const LabTestToUpdate = asyncHandler(async (_, res) => {
  const response = await labTestModel.find({});
  if (!response) throw new ApiError(402, "DATA NOT FOUND !!!");
  res.status(200).json(new ApiResponse(200, { data: response }));
});

export { labTest, LabTestToUpdate };
