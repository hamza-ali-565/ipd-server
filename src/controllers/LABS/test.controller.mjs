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

  const response = await labTestModel.find({});

  let FilterData;
  if (thisIs === "Test") {
    FilterData = response.filter((item) => item?.thisIs !== "Group");
    return res.status(200).json(new ApiResponse(200, { data: FilterData }));
  }
  if (thisIs === "Group") {
    FilterData = response.filter((item) => item?.thisIs == "Group");
    return res.status(200).json(new ApiResponse(200, { data: FilterData }));
  }
  if (thisIs === "IAmGroupParam") {
    FilterData = response.filter(
      (item) =>
        item?.thisIs !== "Group" &&
        item?.active !== false &&
        item?.department === fGroup
    );
    return res.status(200).json(new ApiResponse(200, { data: FilterData }));
  }
});

// get lab charges
const LabChargesCheck = asyncHandler(async (req, res) => {
  const { partyName, partyId } = req?.query;
  console.log("query", req?.query);

  if (!partyName || !partyId)
    throw new ApiError(404, "ALL PARAMETERS ARE REQUIRED !!!");

  // conditional statement to get data of both tests and group
  const testNames = await labTestModel.find({
    $and: [
      { active: true },
      {
        $or: [{ thisIs: "Test" }, { thisIs: "Group" }],
      },
    ],
  });
  // const testNames = await labTestModel.find({
  //   $or: [{ thisIs: "Test" }, { thisIs: "Group" }, { active: true }],
  // });

  console.log(" test Name ", testNames);

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
    const testNamesId = items?._id.toString();
    const isIncluded = idsFromPrevCharges.includes(testNamesId);
    return !isIncluded;
  });

  const newData = [
    ...prevChargesCheck[0]?.labDetails,
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
