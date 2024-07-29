import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";
import AutoIncrementFactory from "mongoose-sequence";

const AutoIncrement = AutoIncrementFactory(mongoose.connection);

const radiologyBooking = new mongoose.Schema({
  radiologyNo: { type: Number, unique: true },
  admissionNo: { type: String },
  mrNo: { type: String, required: true },
  consultant: { type: String },
  party: { type: String, required: true },
  remarks: { type: String },
  patientType: { type: String },
  amount: { type: Number },
  paymentType: { type: String },
  location: { type: String },
  serviceDetails: [
    {
      serviceName: { type: String },
      quantity: { type: String },
      amount: { type: Number },
      serviceId: { type: mongoose.ObjectId },
      uniqueId: { type: String, default: uuidv4 },
      consultant: { type: String },
      isDeleted: { type: Boolean, default: false },
      deletedUser: { type: String },
      deletedOn: { type: String },
      refund: { type: Boolean, default: false },
      refundOn: { type: String },
      refundUser: { type: String },
      createdUser: { type: String },
      createdOn: { type: String },
      deletedUser: { type: String },
      deletedOn: { type: String },
    },
  ],
  createdUser: { type: String },
  createdOn: { type: String, required: true },
  isRemain: { type: Boolean, default: false },
  isDeletedAll: { type: Boolean, default: false },
});

radiologyBooking.plugin(AutoIncrement, { inc_field: "radiologyNo" });

export const RadiologyBookingModel = mongoose.model(
  "Radio Book",
  radiologyBooking
);
