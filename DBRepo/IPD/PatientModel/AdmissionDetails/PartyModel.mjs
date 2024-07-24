import mongoose from "mongoose";

const PartySchema = new mongoose.Schema({
  party: { type: String, required: true },
  activeOnAdmission: { type: Boolean, required: true },
  admissionNo: { type: String, required: true },
  mrNo: { type: String, required: true },
  createdUser: { type: String, required: true },
  createdOn: { type: String, required: true },
});

export const AdmissionPartyModel = mongoose.model(
  "AdmissionParty",
  PartySchema
);

const WardSchema = new mongoose.Schema({
  wardName: { type: String, required: true },
  bedNo: { type: String, required: true },
  bedId: { type: mongoose.ObjectId, required: true },
  activeOnAdmission: { type: Boolean, required: true },
  admissionNo: { type: String, required: true },
  mrNo: { type: String, required: true },
  createdUser: { type: String, required: true },
  createdOn: { type: String, required: true },
});

export const AdmissionWardModel = mongoose.model("AdmissionWard", WardSchema);

const ConsultantSchema = new mongoose.Schema({
  consultantId: { type: mongoose.ObjectId, required: true },
  activeOnAdmission: { type: Boolean, required: true },
  admissionNo: { type: String, required: true },
  mrNo: { type: String, required: true },
  createdUser: { type: String, required: true },
  createdOn: { type: String, required: true },
});

export const AdmissionConsultantModel = mongoose.model(
  "AdmissionConsultant",
  ConsultantSchema
);
