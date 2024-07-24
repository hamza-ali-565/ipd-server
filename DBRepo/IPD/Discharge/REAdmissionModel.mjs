import mongoose from "mongoose";

const reAdmission = mongoose.Schema({
  reAdmissionType: { type: String, required: true },
  reAdmitUser: { type: String, required: true },
  reAdmitDate: { type: String, required: true },
  admissionNo: { type: String, required: true },
  mrNo: { type: String, required: true },
  reason: { type: String },
});

export const REAdmissionModel = new mongoose.model("Re-Admission", reAdmission);
