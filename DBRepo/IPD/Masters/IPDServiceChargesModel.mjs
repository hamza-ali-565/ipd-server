import mongoose from "mongoose";

const ServiceCharges = new mongoose.Schema({
  parentName: { type: String, required: true },
  wardName: { type: String, required: true },
  party: { type: String, required: true },
  serviceDetails: [
    {
      serviceName: { type: String },
      charges: { type: Number },
      status: { type: Boolean },
      serviceId: { type: mongoose.ObjectId },
    },
  ],
  updatedUser: { type: String, required: true },
  updatedOn: { type: String, required: true },
});

export const serviceChargesModel = mongoose.model(
  "Service Charges",
  ServiceCharges
);
