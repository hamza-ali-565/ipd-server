import { asyncHandler } from "../../utils/asyncHandler.mjs";
import { ApiError } from "../../utils/ApiError.mjs";
import { ApiResponse } from "../../utils/ApiResponse.mjs";
import { labResultModel } from "../../models/LAB.Models/labResult.model.mjs";
import { LabChargesModel } from "../../models/LAB.Models/labCharges.model.mjs";
import { LabBookingModel } from "../../models/LAB.Models/LabBooking.model.mjs";
import { labTestModel } from "../../models/LAB.Models/test.model.mjs";
import moment from "moment";
import { getCreatedOn } from "../../constants.mjs";

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

export { labResult, bioGroupResult, getNewRanges, updateLabResult };
