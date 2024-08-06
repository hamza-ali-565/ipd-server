import mongoose, { Schema, model } from "mongoose";
import { getCreatedOn } from "../../constants.mjs";

const LabCharges = new Schema({
  partyName: { type: String, required: true },
  partyId: { type: mongoose.ObjectId, required: true },
  createdUser: { type: String, required: true },
  createdOn: { type: String, default: getCreatedOn() },
  updateUser: { type: String },
  updateOn: { type: String },
  labDetails: [
    {
      testName: { type: String },
      testCode: { type: Number },
      testId: { type: mongoose.ObjectId },
      department: { type: String },
      charges: { type: Number },
      status: { type: Boolean },
    },
  ],
});



export const LabChargesModel = model("Lab Charges", LabCharges);
