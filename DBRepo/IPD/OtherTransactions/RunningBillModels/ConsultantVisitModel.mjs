import mongoose from "mongoose";

const consultantVisitSchema = new mongoose.Schema({
  admissionNo: { type: String, required: true },
  mrNo: { type: String, required: true },
  consultantId: { type: mongoose.ObjectId, required: true },
  consultantName: { type: String, required: true },
  visitDate: { type: String, required: true },
  charges: { type: Number, required: true },
  remarks: { type: String, default: "" },
  isDeleted: { type: Boolean, default: false },
  createdUser: { type: String, required: true },
  createdOn: { type: String, required: true },
  deletedUser: { type: String, default: "" },
  deletedOn: { type: String, default: "" },
});

export const ConsultantVisitModel = mongoose.model(
  "IPDConsultantVisit",
  consultantVisitSchema
);
