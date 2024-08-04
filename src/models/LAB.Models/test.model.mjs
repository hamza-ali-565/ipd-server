import mongoose, { Schema, model } from "mongoose";
import { getCreatedOn } from "../../constants.mjs";

import AutoIncrementFactory from "mongoose-sequence";

const AutoIncrement = AutoIncrementFactory(mongoose.connection);

const labTest = new Schema({
  testCode: { type: Number, unique: true },
  testName: { type: String, required: true, uppercase: true },
  department: { type: String, required: true },
  category: { type: String },
  testType: { type: String, required: true },
  reportDays: { type: String, required: true },
  active: { type: Boolean, required: true },
  style: { type: Array, required: true }, // array
  testRanges: { type: Array }, //array
  thisIs: { type: String, required: true },
  createdUser: { type: String, required: true },
  createdOn: { type: String, default: getCreatedOn() },
  updatedUser: { type: String },
  updatedOn: { type: String },
  groupParams: { type: Array },
});

labTest.plugin(AutoIncrement, { inc_field: "testCode" });

export const labTestModel = model("Lab Test", labTest);
