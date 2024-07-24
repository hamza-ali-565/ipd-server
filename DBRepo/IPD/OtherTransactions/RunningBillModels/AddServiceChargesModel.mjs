import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

import AutoIncrementFactory from "mongoose-sequence";

const AutoIncrement = AutoIncrementFactory(mongoose.connection);

const AddServiceCharges = new mongoose.Schema({
  admissionNo: { type: String, required: true },
  mrNo: { type: String, required: true },
  serviceNo: { type: Number, unique: true },
  createdOn: { type: String, required: true },
  serviceDetails: [
    {
      serviceName: { type: String },
      serviceId: { type: mongoose.ObjectId },
      uniqueServiceId: { type: String, default: uuidv4 },
      isdeleted: { type: Boolean, default: false },
      charges: { type: Number },
      amount: { type: Number },
      createdUser: { type: String },
      deletedUser: { type: String },
      deletedOn: { type: String },
    },
  ],
});

AddServiceCharges.plugin(AutoIncrement, { inc_field: "serviceNo" });

export const AddServiceChargesModel = mongoose.model(
  "AddmissionServiceCharges",
  AddServiceCharges
);
