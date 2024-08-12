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

// const convertToDays = ({ year, month, day }) => {
//   return moment.duration({ years: year, months: month, days: day }).asDays();
// };

// const findMatchingRange = (testRanges, age, gender) => {
//   // const totalDays = convertToDays(age);
//   const totalDays = moment
//     .duration({
//       years: age.years,
//       months: age.months,
//       days: age.days,
//     })
//     .asDays();
//   console.log("Total days based on age:", totalDays);

//   for (let range of testRanges) {
//     const fromAgeInDays = convertToDays({
//       year: range.ageType === "Years" ? range.fromAge : 0,
//       month: range.ageType === "Months" ? range.fromAge : 0,
//       day: range.ageType === "Days" ? range.fromAge : 0,
//     });
//     const toAgeInDays = convertToDays({
//       year: range.ageType === "Years" ? range.toAge : 0,
//       month: range.ageType === "Months" ? range.toAge : 0,
//       day: range.ageType === "Days" ? range.toAge : 0,
//     });

//     console.log("Checking range:", {
//       gender: range.gender,
//       fromAgeInDays,
//       toAgeInDays,
//       normalRanges: range.normalRanges,
//     });

//     if (
//       totalDays >= fromAgeInDays &&
//       totalDays <= toAgeInDays &&
//       range.gender.toLowerCase() === gender.toLowerCase()
//     ) {
//       console.log("Matching range found:", range.normalRanges);
//       return range.normalRanges;
//     }
//   }

//   console.log("No matching range found for", { age, gender });
//   return null;
// };


// result of biochemistry groups
// const bioGroupResult = asyncHandler(async (req, res) => {
//   const { age, gender, groupParams } = req?.body;

//   const testIds = groupParams.groupParams.map((items) => items?.testId);

//   const tests = await labTestModel
//     .find({ _id: { $in: testIds } })
//     .select("testRanges");

//   console.log(gender);
//   // age: { years: 23, months: 12, days: 22 }

//   // gender : Male
//   // group are in groupParams for example
//   // [
//   //   {
//   //     serialNo: 1,
//   //     testCode: 1,
//   //     testName: 'CBC ESR',
//   //     category: 'Test',
//   //     bold: false,
//   //     italic: false,
//   //     underline: false,
//   //     fontSize: '8px',
//   //     testId: '66ad0428022e1a28e99415c2'
//   //   },
//   //   {
//   //     serialNo: 2,
//   //     testCode: 2,
//   //     testName: 'CBC ESR',
//   //     category: 'Test',
//   //     bold: false,
//   //     italic: false,
//   //     underline: false,
//   //     fontSize: '8px',
//   //     testId: '66ad045d213c9856db89f06a'
//   //   }
//   // ],

//   // test ranges are in tests constant for example
//   // [
//   //   {
//   //     testRanges: [
//   //       { fromAge: 5, toAge: 30, ageType: "Years", gender: "Female", normalRanges: "AlphaG" },
//   //       { fromAge: 5, toAge: 20, ageType: "Months", gender: "Male", normalRanges: "Beta" },
//   //       { fromAge: 5, toAge: 20, ageType: "Months", gender: "Female",normalRanges: "BetaG" },
//   //       { fromAge: 5, toAge: 30, ageType: "Years", gender: "Male", normalRanges: "Alpha" },
//   //       { fromAge: 5, toAge: 20, ageType: "Day", gender: "Male", normalRanges: "gamma" },
//   //       { fromAge: 5, toAge: 20, ageType: "Day", gender: "Female", normalRanges: "gammaG" },
//   //     ],
//   //     _id: "66ad0428022e1a28e99415c2",
//   //   },
//   //  {
//   //     testRanges: [
//   //       { fromAge: 5, toAge: 30, ageType: "Years", gender: "Female", normalRanges: "goG" },
//   //       { fromAge: 5, toAge: 20, ageType: "Months", gender: "Male", normalRanges: "goa" },
//   //       { fromAge: 5, toAge: 20, ageType: "Months", gender: "Female",normalRanges: "goaG" },
//   //       { fromAge: 5, toAge: 30, ageType: "Years", gender: "Male", normalRanges: "go" },
//   //       { fromAge: 5, toAge: 20, ageType: "Day", gender: "Male", normalRanges: "gone" },
//   //       { fromAge: 5, toAge: 20, ageType: "Day", gender: "Female", normalRanges: "goneG" },
//   //     ],
//   //   _id: "66ad045d213c9856db89f06a",
//   //   },
//   // ];
//   //     _id: "66ad045d213c9856db89f06a",
//   // conclusion i've dianamic data

//   // output should be
//   // [
//   //  { serialNo:1, _id: "66ad0428022e1a28e99415c2", ageType: "Years", gender: "Male", normalRanges: "Alpha" },
//   //  { serialNo:2, _id: "66ad045d213c9856db89f06a", ageType:"Years", gender: "Male", normalRanges: "go" },
//   //]

//   const totalDays = moment
//     .duration({
//       years: age.years,
//       months: age.months,
//       days: age.days,
//     })
//     .asDays();
//   console.log(totalDays);

//   return res.status(200).json(new ApiResponse(200, { data: tests }));
//   const output = groupParams.groupParams.map((groupItem) => {
//     const test = tests.find(
//       (testItem) => testItem._id.toString() === groupItem.testId
//     );
//     console.log("test of test", test);

//     if (test) {
//       const normalRanges = findMatchingRange(test.testRanges, age, gender);

//       return {
//         testName: groupItem.testName,
//         testCode: groupItem.testCode,
//         normalRanges,
//       };
//     } else {
//       return {
//         testName: groupItem.testName,
//         testCode: groupItem.testCode,
//         normalRanges: null,
//       };
//     }
//   });

//   return res.status(200).json(new ApiResponse(200, { data: output }));
// });

const bioGroupResult = asyncHandler(async (req, res) => {
  const { age, gender, groupParams } = req.body;

  // Extract test IDs from groupParams
  const testIds = groupParams.groupParams.map((item) => item.testId);

  // Fetch tests with matching IDs
  const tests = await labTestModel
    .find({ _id: { $in: testIds } })
    .select("testRanges");

  console.log("Retrieved test ranges:", tests[0].testRanges);

  // Helper function to convert age to days for comparison
  const convertToDays = ({ year, month, day }) => {
    return moment.duration({ years: year, months: month, days: day }).asDays();
  };

  // Function to find a matching range based on age and gender
  const findMatchingRange = (testRanges, age, gender) => {
    // const totalDays = convertToDays(age);
    const totalDays = moment
    .duration({
      years: age.years,
      months: age.months,
      days: age.days,
    })
    .asDays();

    console.log("Total Days of Age:", totalDays);
    console.log("Gender:", gender);

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

      console.log("Checking Range:", range);
      console.log("From Age in Days:", fromAgeInDays);
      console.log("To Age in Days:", toAgeInDays);

      if (
        totalDays >= fromAgeInDays &&
        totalDays <= toAgeInDays &&
        range.gender.trim().toLowerCase() === gender.trim().toLowerCase()
      ) {
        console.log("Matched Range:", range.normalRanges);
        return range.normalRanges;
      }
    }

    console.log("No Matching Range Found");
    return null;
  };

  // Create output array with matching ranges
  const results = groupParams.groupParams.map((item) => {
    const test = tests.find(
      (testItem) => testItem._id.toString() === item.testId
    );

    if (test) {
      const normalRanges = findMatchingRange(test.testRanges, age, gender);

      return {
        testName: item.testName,
        testCode: item.testCode,
        normalRanges: normalRanges || "No Matching Range Found",
        serialNo: item.serialNo,
      };
    } else {
      return {
        testName: item.testName,
        testCode: item.testCode,
        normalRanges: "No Matching Range Found",
        serialNo: item.serialNo,
      };
    }
  });

  // Send results as JSON response
  res.status(200).json(new ApiResponse(200, { data: results }));
});


export { labResult, bioGroupResult };
