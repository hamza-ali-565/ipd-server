import { asyncHandler } from "../../utils/asyncHandler.mjs";
import { ApiError } from "../../utils/ApiError.mjs";
import { ApiResponse } from "../../utils/ApiResponse.mjs";
import { labResultModel } from "../../models/LAB.Models/labResult.model.mjs";
import { LabChargesModel } from "../../models/LAB.Models/labCharges.model.mjs";
import { LabBookingModel } from "../../models/LAB.Models/LabBooking.model.mjs";
import { labTestModel } from "../../models/LAB.Models/test.model.mjs";
import moment from "moment";

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
        return range.normalRanges;
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
        normalRanges: normalRanges || null, // Set to null if no matching range found
        category: test.category, // Include category from test
        serialNo: item.serialNo,
        unit: test?.testRanges[0]?.unit,
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
      };
    }
  });

  // Format the output as required
  const output = results.map((result) => {
    if (result.category === "Test") {
      return {
        normalRange: result.normalRanges,
        testName: result.testName,
        category: result.category,
        testCode: result?.testCode,
        serialNo: result?.serialNo,
        unit: result?.unit,
        italic: result?.italic,
        bold: result?.bold,
        underline: result?.underline,
        fontSize: result?.fontSize,
      };
    } else {
      return {
        testName: result.testName,
        category: result.category,
        testCode: result?.testCode,
        serialNo: result?.serialNo,
      };
    }
  });

  // Send results as JSON response
  res.status(200).json(new ApiResponse(200, { data: output, results }));
});

export { labResult, bioGroupResult };
