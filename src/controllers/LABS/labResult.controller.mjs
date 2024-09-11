import { asyncHandler } from "../../utils/asyncHandler.mjs";
import { ApiError } from "../../utils/ApiError.mjs";
import { ApiResponse } from "../../utils/ApiResponse.mjs";
import { labResultModel } from "../../models/LAB.Models/labResult.model.mjs";
import { LabChargesModel } from "../../models/LAB.Models/labCharges.model.mjs";
import { LabBookingModel } from "../../models/LAB.Models/LabBooking.model.mjs";
import { labTestModel } from "../../models/LAB.Models/test.model.mjs";
import moment from "moment";
import { getCreatedOn } from "../../constants.mjs";
import { PatientRegModel } from "../../../DBRepo/IPD/PatientModel/PatientRegModel.mjs";
import { SpecimenModel } from "../../models/LAB.Models/Specimen.model.mjs";
import { MicroscopyDataModel } from "../../models/LAB.Models/MicroscopyData.model.mjs";

// post result of biochemistry
const labResult = asyncHandler(async (req, res) => {
  const { mrNo, labNo, resultDepart, resultData, testId, testName } = req.body;
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
    testId,
    testName,
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

// get data to edit //
const getDataToEdit = asyncHandler(async (req, res) => {
  const { labNo } = req?.query;
  if (!labNo) throw new ApiError(400, "LAB NO IS REQUIRED !!!");
  const response = await labResultModel.find({ labNo });
  if (response.length <= 0) throw new ApiError(401, "DO DATA FOUND !!!");
  const patientData = await PatientRegModel.find({ MrNo: response[0]?.mrNo });
  const labData = await LabBookingModel.find({ labNo });

  return res.status(200).json(
    new ApiResponse(200, {
      data: response,
      patientData,
      labCDetails: labData,
    })
  );
});

// Edit update of test Result
const updateLabResult = asyncHandler(async (req, res) => {
  const { labNo, _id, resultData } = req.body;
  console.log({ labNo, _id, resultData });

  if (!labNo || !_id || !resultData)
    throw new ApiError(400, "ALL PARAMETERS ARE REQUIRED");
  const updateResult = await labResultModel.findOneAndUpdate(
    { labNo, _id },
    { resultData, updatedUser: req?.user?.userId, updatedOn: getCreatedOn() },
    { new: true }
  );
  if (!updateResult) throw new ApiError(401, "PLEASE TRY LATER");
  return res.status(200).json(new ApiResponse(200, { data: updateResult }));
});
// get test ranges of groups
const bioGroupResult = asyncHandler(async (req, res) => {
  const { age, gender, groupParams } = req.body;

  console.log({ groupParams: groupParams?.groupParams });

  // Extract test IDs from groupParams
  const testIds = groupParams.groupParams.map((item) => item.testId);

  // Fetch tests with matching IDs
  const tests = await labTestModel
    .find({ _id: { $in: testIds } })
    .select("testRanges category testCode");

  console.log("Retrieved test ranges:", tests);

  // Helper function to convert age to days for comparison
  const convertToDays = ({ year, month, day }) => {
    return moment.duration({ years: year, months: month, days: day }).asDays();
  };

  // Function to find a matching range based on age and gender
  const findMatchingRange = (testRanges, age, gender) => {
    const totalDays = moment
      .duration({
        years: age.years,
        months: age.months,
        days: age.days,
      })
      .asDays();

    for (let range of testRanges) {
      const fromAgeInDays = convertToDays({
        year: range.ageType === "Years" ? parseInt(range.fromAge, 10) : 0,
        month: range.ageType === "Months" ? parseInt(range.fromAge, 10) : 0,
        day: range.ageType === "Days" ? parseInt(range.fromAge, 10) : 0,
      });
      const toAgeInDays = convertToDays({
        year: range.ageType === "Years" ? parseInt(range.toAge, 10) : 0,
        month: range.ageType === "Months" ? parseInt(range.toAge, 10) : 0,
        day: range.ageType === "Days" ? parseInt(range.toAge, 10) : 0,
      });

      if (
        totalDays >= fromAgeInDays &&
        totalDays <= toAgeInDays &&
        range.gender.trim().toLowerCase() === gender.trim().toLowerCase()
      ) {
        return {
          ranges: range.normalRanges,
          min: range?.min,
          max: range?.max,
          unit: range?.unit,
        };
      }
    }

    return null;
  };

  // Create output array with matching ranges and category
  const results = groupParams.groupParams.map((item) => {
    const test = tests.find(
      (testItem) => testItem._id.toString() === item.testId
    );

    if (test) {
      const normalRanges = findMatchingRange(test.testRanges, age, gender);
      // console.log();

      return {
        testName: item.testName,
        testCode: item.testCode,
        normalRanges: normalRanges?.ranges || null, // Set to null if no matching range found
        category: test.category, // Include category from test
        serialNo: item.serialNo,
        unit: normalRanges?.unit,
        min: normalRanges?.min,
        max: normalRanges?.max,
        italic: item?.italic,
        bold: item?.bold,
        underline: item?.underline,
        fontSize: item?.fontSize,
      };
    } else {
      return {
        testName: item.testName,
        testCode: item.testCode,
        normalRanges: null, // Set to null if test not found
        category: null,
        serialNo: item.serialNo,
        italic: item?.italic,
        bold: item?.bold,
        underline: item?.underline,
        fontSize: item?.fontSize,
      };
    }
  });

  // Format the output as required
  const output = results.map((result) => {
    if (result.category === "Test") {
      return {
        testRanges: result.normalRanges,
        testName: result.testName,
        category: result.category,
        testCode: result?.testCode,
        serialNo: result?.serialNo,
        min: result?.min,
        max: result?.max,
        unit: result?.unit,
        italic: result?.italic,
        bold: result?.bold,
        underline: result?.underline,
        fontSize: result?.fontSize,
        result: "",
        remarks: "",
      };
    } else {
      return {
        testName: result.testName,
        category: result.category,
        testCode: result?.testCode,
        serialNo: result?.serialNo,
        italic: result?.italic,
        bold: result?.bold,
        underline: result?.underline,
        fontSize: result?.fontSize,
      };
    }
  });

  // Send results as JSON response
  res.status(200).json(new ApiResponse(200, { data: output }));
});

// Update Data Api
const getNewRanges = asyncHandler(async (req, res) => {
  const { patientData, testData, testId } = req?.body;
  const newTestRanges = await labTestModel.find({
    _id: testId,
  });
  console.log("newTestRanges ", testData);
  const data = await viewDataToEnterResult(
    newTestRanges[0],
    patientData,
    testData
  );
  return res.status(200).json(new ApiResponse(200, { data }));
});

// Update Test Data Function
const viewDataToEnterResult = async (data, patientData, testData) => {
  const age =
    patientData.length > 0
      ? `${patientData[0]?.ageYear ? patientData[0]?.ageYear : "0"} Years ${
          patientData[0]?.ageMonth ? patientData[0]?.ageMonth : "0"
        } Months ${patientData[0]?.ageDay ? patientData[0]?.ageDay : "0"} Days`
      : "";

  // extact gender to get get ranges gender wise
  let gender = patientData[0].gender;

  // convert age into object
  const parseAge = (ageString) => {
    const regex = /(\d+)\s*Years\s*(\d+)\s*Months\s*(\d+)\s*Days/;
    const matches = ageString.match(regex);

    if (matches) {
      return {
        years: parseInt(matches[1], 10),
        months: parseInt(matches[2], 10),
        days: parseInt(matches[3], 10),
      };
    }

    return null; // or handle the error as you like
  };

  //  converted age
  const givenAge = parseAge(age);

  if (data.groupParams.length > 0) {
    const dataDetails = await getGroupData(givenAge, gender, data, testData);

    return dataDetails;
  }

  // Convert given age to days for comparison
  const totalDays = moment
    .duration({
      years: givenAge.years,
      months: givenAge.months,
      days: givenAge.days,
    })
    .asDays();

  // extract normal ranges from data
  let normalRanges = [];
  if (data.groupParams.length <= 0) {
    normalRanges = data?.testRanges;
  }

  // Function to convert age range to days
  const convertToDays = (age, ageType) => {
    switch (ageType) {
      case "Days":
        return age;
      case "Months":
        return moment.duration(age, "months").asDays();
      case "Years":
        return moment.duration(age, "years").asDays();
      default:
        return 0;
    }
  };

  // Find matching range
  const matchingRange = normalRanges.find((range) => {
    const fromAgeInDays = convertToDays(range.fromAge, range.ageType);
    const toAgeInDays = convertToDays(range.toAge, range.ageType);
    return (
      totalDays >= fromAgeInDays &&
      totalDays <= toAgeInDays &&
      range.gender.toLowerCase() === gender.toLowerCase()
    );
  });
  let enrichedMatchingRange;

  if (matchingRange) {
    // Directly modifying the existing object

    // Alternatively, you can create a new object by merging the original with additional data
    enrichedMatchingRange = {
      ...matchingRange,
      result: testData[0]?.result,
      testCode: testData[0]?.testCode,
      testName: testData[0]?.testName,
      remarks: testData[0]?.remarks,
    };
  }
  const data432 = [enrichedMatchingRange];
  return data432;
  // console.log("Matching Range:", testMatchedRange);
};

//Update  group Data Function
const getGroupData = async (age, gender, groupParams, testData) => {
  // Extract test IDs from groupParams
  const testIds = groupParams.groupParams.map((item) => item.testId);

  // Fetch tests with matching IDs
  const tests = await labTestModel
    .find({ _id: { $in: testIds } })
    .select("testRanges category testCode");

  // Helper function to convert age to days for comparison
  const convertToDays = ({ year, month, day }) => {
    return moment.duration({ years: year, months: month, days: day }).asDays();
  };

  // Function to find a matching range based on age and gender
  const findMatchingRange = (testRanges, age, gender) => {
    const totalDays = moment
      .duration({
        years: age.years,
        months: age.months,
        days: age.days,
      })
      .asDays();

    for (let range of testRanges) {
      const fromAgeInDays = convertToDays({
        year: range.ageType === "Years" ? parseInt(range.fromAge, 10) : 0,
        month: range.ageType === "Months" ? parseInt(range.fromAge, 10) : 0,
        day: range.ageType === "Days" ? parseInt(range.fromAge, 10) : 0,
      });
      const toAgeInDays = convertToDays({
        year: range.ageType === "Years" ? parseInt(range.toAge, 10) : 0,
        month: range.ageType === "Months" ? parseInt(range.toAge, 10) : 0,
        day: range.ageType === "Days" ? parseInt(range.toAge, 10) : 0,
      });

      if (
        totalDays >= fromAgeInDays &&
        totalDays <= toAgeInDays &&
        range.gender.trim().toLowerCase() === gender.trim().toLowerCase()
      ) {
        return {
          ranges: range.normalRanges,
          min: range?.min,
          max: range?.max,
          unit: range?.unit,
        };
      }
    }

    return null;
  };

  // Create output array with matching ranges and category
  const results = groupParams.groupParams.map((item) => {
    const test = tests.find(
      (testItem) => testItem._id.toString() === item.testId
    );

    if (test) {
      const normalRanges = findMatchingRange(test.testRanges, age, gender);

      return {
        testName: item.testName,
        testCode: item.testCode,
        normalRanges: normalRanges?.ranges || null, // Set to null if no matching range found
        category: test.category, // Include category from test
        serialNo: item.serialNo,
        unit: normalRanges?.unit,
        min: normalRanges?.min,
        max: normalRanges?.max,
        italic: item?.italic,
        bold: item?.bold,
        underline: item?.underline,
        fontSize: item?.fontSize,
      };
    } else {
      return {
        testName: item.testName,
        testCode: item.testCode,
        normalRanges: null, // Set to null if test not found
        category: null,
        serialNo: item.serialNo,
        italic: item?.italic,
        bold: item?.bold,
        underline: item?.underline,
        fontSize: item?.fontSize,
      };
    }
  });

  results.forEach((items) => {
    const matchItems = testData.find(
      (newItems) => newItems?.testCode === items?.testCode
    );
    if (matchItems) {
      items.result = matchItems?.result || items?.result;
      items.remarks = matchItems?.remarks || items?.remarks;
    }
  });

  return results;
};

// create Specimen
const LabSpecimen = asyncHandler(async (req, res) => {
  const { specimen, type } = req.body;
  if (![specimen].every(Boolean))
    throw new ApiError(400, "ALL PARAMETERS ARE REQUIRED !!!");
  const specimenData = specimen.trim();
  const response = await SpecimenModel.create({
    specimen: specimenData,
    type,
    createdUser: req?.user?.userId,
  });
  if (!response)
    throw new ApiError(401, "DATA CREATION FAILED PLEASE TRY LATER");
  res.status(200).json(new ApiResponse(200, { data: response }));
});

// get specimen
const labSpecimenDisp = asyncHandler(async (req, res) => {
  const { type } = req?.query;
  const response = await SpecimenModel.find({ type });
  if (response.length <= 0) throw new ApiError(404, "NO DATA FOUND !!!");
  res.status(200).json(new ApiResponse(200, { data: response }));
});

// Microscopy Parent
const microscopyParent = asyncHandler(async (req, res) => {
  const { parentName } = req.body;

  if (![parentName].every(Boolean))
    throw new Error(400, "ALL PARAMETERS ARE REQUIRED !!!");

  const response = await MicroscopyDataModel.create({
    parentName,
  });

  return res.status(200).send(new ApiResponse(200, { data: response }));
});

// All Parents Microscopy
const MicroDataParentForw = asyncHandler(async (req, res) => {
  const response = await MicroscopyDataModel.find({}).select("parentName");
  if (response.length <= 0) throw new ApiError(404, "DATA NOT FOUND !!!");
  return res.status(200).send(new ApiResponse(200, { data: response }));
});
// Microscopy Data
const microscopyData = asyncHandler(async (req, res) => {
  const { parentName, childData, _id } = req.body;

  if (![parentName, childData].every(Boolean))
    throw new Error(400, "ALL PARAMETERS ARE REQUIRED !!!");

  childData?.map((items, index) => {
    if (!items?.name)
      throw new ApiError(`Some Data missed at line no. ${index + 1}`);
    return;
  });
  let newData = [];
  const getbackData = await MicroscopyDataModel.find({ _id });
  console.log("get back data ", getbackData[0].childData);
  if (getbackData[0].childData?.length > 0) {
    newData = [...childData, ...getbackData[0].childData];
  }

  console.log("newdata ", newData);
  const response = await MicroscopyDataModel.findOneAndUpdate(
    { _id },
    {
      $set: {
        childData: (newData.length <= 0 && childData) || newData,
        lastUpdateOn: getCreatedOn(),
      },
    },
    { new: true }
  );

  return res.status(200).send(new ApiResponse(200, { data: response }));
});
// Parent wise child data
const getChildData = asyncHandler(async (req, res) => {
  const { _id } = req.query;
  console.log("_id", _id);

  if (!_id) throw new ApiError(400, "PARENT DATA IS REQUIRED !!!");
  const response = await MicroscopyDataModel.find({ _id });
  console.log("response ", response);

  if (response[0]?.childData.length <= 0)
    throw new ApiError(404, "DATA NOT FOUND!!!");
  return res.status(200).json(new ApiResponse(200, { data: response }));
});
// update MicroChild Param
const UpdateChild = asyncHandler(async (req, res) => {
  const { _id, name } = req?.body;
  if (![_id, name].every(Boolean))
    throw new ApiError(402, "ALL PARAMETERS ARE REQUIRED !!!");
  const response = await MicroscopyDataModel.findOneAndUpdate(
    { "childData._id": _id },
    {
      $set: {
        "childData.$.name": name,
        "childData.$.createdUser": req?.user?.userId,
      },
    },
    { new: true }
  );
  return res.status(200).json(new ApiResponse(200, { data: response }));
});

const allDataWithChild = asyncHandler(async (req, res) => {
  const response = await MicroscopyDataModel.find();
  if (response.length <= 0) throw new ApiError(404, "NO DATA FOUND !!!");
  return res.status(200).json(new ApiResponse(200, { data: response }));
});

const MicrobiologyData = asyncHandler(async (req, res) => {
  const {
    mrNo,
    labNo,
    createdUser,
    resultDepart,
    testName,
    testId,
    microscopy,
    culture,
    gramStain,
    organism,
    MicroscopicData,
    remarks,
    result,
  } = req.body;
  if (![mrNo, labNo, testName, testId].every(Boolean))
    throw new ApiError(404, "ALL PARAMETERS ARE REQUIRED !!!");
});

export {
  labResult,
  bioGroupResult,
  getNewRanges,
  updateLabResult,
  getDataToEdit,
  LabSpecimen,
  labSpecimenDisp,
  microscopyData,
  microscopyParent,
  MicroDataParentForw,
  getChildData,
  UpdateChild,
  allDataWithChild,
};
