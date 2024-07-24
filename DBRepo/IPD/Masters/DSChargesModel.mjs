import mongoose from "mongoose";

const DSCharges = new mongoose.Schema({
  party: { type: String, required: true },
  parentName: { type: String, required: true },
  serviceDetails: [
    {
      serviceName: { type: String, required: true },
      charges: { type: String, required: true },
      status: { type: Boolean },
      serviceId: { type: mongoose.ObjectId },
    },
  ],
  updatedUser: { type: String, required: true },
  updatedOn: { type: String, required: true },
});

export const DSChargesModel = mongoose.model("DS Charges", DSCharges);
