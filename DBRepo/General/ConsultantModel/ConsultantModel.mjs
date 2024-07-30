import mongoose, { Schema } from "mongoose";
import { getCreatedOn } from "../../../src/constants.mjs";

const consultant = new Schema({
  name: { type: String, required: true },
  speciality: { type: String, required: true },
  specialityId: {type: mongoose.ObjectId, required: true},
  pmdc: { type: String },
  address: { type: String },
  email: { type: String },
  cnic: { type: String, required: true },
  phone: { type: String },
  status: { type: Boolean, default: false },
  days: {type: String, required: true},
  timing: {type: String, required: true},
  createdUser: { type: String, required: true },
  createdOn: { type: String },
  updatedUser: { type: String },
  updatedOn: { type: String },
});

export const ConsultantsModel = mongoose.model("Consultant New", consultant);

const speciality = new Schema({
  speciality: { type: String, required: true },
  createdUser: { type: String, required: true },
  createdOn: { type: String, required: true },
  updatedUser: { type: String },
  updatedOn: { type: String },
});

export const SpecialityModel = mongoose.model("Speciality", speciality);
