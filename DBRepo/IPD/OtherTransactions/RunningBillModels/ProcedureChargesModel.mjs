import mongoose from "mongoose";

const procedureCharges = new mongoose.Schema({
  admissionNo: { type: String, required: true },
  mrNo: { type: String, required: true },
  consultantName: { type: String, required: true },
  consultantId: { type: mongoose.ObjectId, required: true },
  procedureName: { type: String, required: true },
  amount: { type: Number, required: true },
  procedureDate: { type: String, required: true },
  remarks: { type: String },
  createdUser: { type: String, required: true },
  createdOn: { type: String, required: true },
  isDeleted: { type: Boolean, default: false },
  deletedUser: { type: String },
  deletedOn: { type: String },
});
export const ProcedureChargesModel = mongoose.model(
  "ProcedureCharges",
  procedureCharges
);
