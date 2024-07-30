import mongoose, { Schema } from "mongoose";

const OPDConsultantCharges = new Schema({
  consultantName: { type: String, required: true },
  consultantId: { type: String, required: true },
  party: { type: String, required: true },
  partyId: { type: String, required: true },
  amount: { type: Number, required: true },
  createdUser: { type: String, required: true },
  createdOn: { type: String, required: true },
  updatedUser: { type: String },
  updatedOn: { type: String },
});


export const ConsChargesModel = mongoose.model(
  "OPD CONS CHARGES",
  OPDConsultantCharges
);
