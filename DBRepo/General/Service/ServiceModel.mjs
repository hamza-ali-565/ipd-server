import mongoose from "mongoose";

const serviceName = new mongoose.Schema({
  parentName: { type: String, required: true },
  serviceName: { type: String, required: true },
  createdOn: { type: String },
  createdUser: { type: String, required: true },
  updatedUser: { type: String },
});

export const serviceNameModel = mongoose.model("Service Name", serviceName);
