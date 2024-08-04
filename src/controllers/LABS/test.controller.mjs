import { ApiError } from "../../utils/ApiError.mjs";
import { asyncHandler } from "../../utils/asyncHandler.mjs";
import { ApiResponse } from "../../utils/ApiResponse.mjs";
import { labTestModel } from "../../models/LAB.Models/test.model.mjs";
import { getCreatedOn } from "../../constants.mjs";
import { LabChargesModel } from "../../models/LAB.Models/labCharges.model.mjs";

// create lab code
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
    groupParams,
    _id,
    thisIs,
  } = req.body;

  if (![testName, department, testType, reportDays, thisIs].every(Boolean)) {
    throw new ApiError(400, "All fields are required");
  }
  if (thisIs === "Test") {
    if (!category) {
      throw new ApiError(404, "CATEGORY IS REQUIRED !!!");
      return;
    }
  }
  let rangeInfo = [];
  if (testRanges) {
    if (testRanges.length > 0) {
      rangeInfo = testRanges.filter((items) => items.equipment !== "");
    }
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
      thisIs,
      createdUser: req?.user?.userId,
      groupParams,
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
          thisIs,
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
const LabTestToUpdate = asyncHandler(async (req, res) => {
  let { thisIs, fGroup } = req?.query;

  if (!thisIs) throw new ApiError(404, "ALL PARAMETERS ARE REQUIRED !!!");
  const response = await labTestModel.find({
    $or: [{ thisIs }, { department: thisIs }],
  });
  if (!response) throw new ApiError(402, "DATA NOT FOUND !!!");

  if (fGroup !== "") {
    const updatedData = response.filter((item) => item.thisIs !== "Group");
    res.status(200).json(new ApiResponse(200, { data: updatedData }));
    return;
  }
  res.status(200).json(new ApiResponse(200, { data: response }));
});

// get lab charges
const LabChargesCheck = asyncHandler(async (req, res) => {
  const { partyName, partyId } = req?.query;
  console.log("query", req?.query);

  if (!partyName || !partyId)
    throw new ApiError(404, "ALL PARAMETERS ARE REQUIRED !!!");
  const testNames = await labTestModel.find({
    $or: [{ category: "Test"}, {thisIs: "Group" }],
  });

  // {
  //   category: "Test",
  //   thisIs: "Group",
  // }

  console.log(testNames);

  const formatedData = testNames.map((items) => ({
    testName: items?.testName,
    testCode: items?.testCode,
    testId: items?._id,
    department: items?.department,
    charges: 0,
    status: false,
  }));

  // check if rates previously exist
  const prevChargesCheck = await LabChargesModel.find({ partyId, partyName });

  if (prevChargesCheck.length <= 0) {
    return res.status(200).json(new ApiResponse(200, { data: formatedData }));
  }

  const idsFromPrevCharges = prevChargesCheck[0].labDetails.map((items) =>
    items?.testId.toString()
  );

  const filterChargedIdsFromTestName = testNames.filter((items) => {
    const testNamesId = items?._id.toUpperCase();
    const isIncluded = idsFromPrevCharges.includes(testNamesId);
    return !isIncluded;
  });

  const newData = [
    ...prevChargesCheck[0]?.serviceDetails,
    ...filterChargedIdsFromTestName.map((item) => ({
      serviceName: item?.serviceName,
      serviceId: item?._id,
      charges: 0,
      status: false,
    })),
  ];

  return res.status.json(new ApiResponse(200, { data: newData }));
});

export { labTest, LabTestToUpdate, LabChargesCheck };
