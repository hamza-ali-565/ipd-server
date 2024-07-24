import mongoose from "mongoose";

const dischargeSummary = new mongoose.Schema({
  mrNo: { type: String, required: true },
  admissionNo: { type: String, required: true },
  createUser: { type: String, required: true },
  createdOn: { type: String, required: true },
  dischargeCondition: { type: String, required: true },
  dischargeDoctor: { type: String, required: true },
  dischargeSummaryData: { type: Array, required: true },
});

export const DischargeSummaryModel = mongoose.model(
  "Discharge Summary",
  dischargeSummary
);
