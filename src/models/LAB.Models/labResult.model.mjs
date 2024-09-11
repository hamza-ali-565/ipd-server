import { Schema, model } from "mongoose";
import { getCreatedOn } from "../../constants.mjs";

const labResult = new Schema({
  mrNo: { type: String, required: true },
  labNo: { type: String, required: true },
  createdUser: { type: String, required: true },
  createdOn: { type: String, default: getCreatedOn() },
  resultDepart: { type: String, required: true },
  resultData: { type: Array, required: true },
  updatedUser: { type: String },
  updatedOn: { type: String },
  testName: { type: String, required: true },
  testId: { type: String, required: true },
});

export const labResultModel = model("LabResult", labResult);

const MicrobiologyResult = new Schema({
  mrNo: { type: String, required: true },
  labNo: { type: String, required: true },
  createdUser: { type: String, required: true },
  createdOn: { type: String, default: getCreatedOn() },
  resultDepart: { type: String, required: true },
  updatedUser: { type: String },
  updatedOn: { type: String },
  testName: { type: String, required: true },
  testId: { type: String, required: true },
  microscopy: [
    {
      microscopy: { type: String },
      result: { type: String },
    },
  ],
  culture: [
    {
      culture: { type: String },
      result: { type: String },
    },
  ],
  gramStain: [
    {
      gramStain: { type: String },
      result: { type: String },
    },
  ],
  organism: [
    {
      organism: { type: String },
    },
  ],
  MicroscopicData: { type: Array },
  remarks: { type: String },
  result: { type: String },
});
export const MicroBioResultModal = model(
  "MicrobiologyResult",
  MicrobiologyResult
);
