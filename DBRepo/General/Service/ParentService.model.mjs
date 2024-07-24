import mongoose from "mongoose";

const parentServiceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  createdUser: { type: String, required: true },
  createdOn: { type: String, required: true },
});

export const ParentServiceModel = mongoose.model(
  "ParentServiceName",
  parentServiceSchema
);
