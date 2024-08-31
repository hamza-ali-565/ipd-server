import { Schema, model } from "mongoose";
import { getCreatedOn } from "../../constants.mjs";

const specimen = new Schema({
  specimen: { type: String, required: true },
  createdUser: { type: String },
  createdOn: { type: String, default: getCreatedOn() },
  type: { type: String, required: true },
  updatedUser: { type: String },
  updatedOn: { type: String },
});

export const SpecimenModel = model("LabSpecimen", specimen);
