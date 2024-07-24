import mongoose from "mongoose";

const consultantCharges = new mongoose.Schema({
  party: { type: String, required: true },
  wardName: { type: String, required: true },
  updatedUser: { type: String, required: true },
  updatedOn: { type: String, required: true },
  consultantDetails: [
    {
      name: { type: String, required: true },
      consultantId: { type: mongoose.ObjectId, required: true },
      charges: { type: Number, required: true },
      status: { type: Boolean },
    },
  ],
});

export const ConsultantChargesModel = mongoose.model(
  "Consultant Charges New",
  consultantCharges
);
