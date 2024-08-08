import mongoose, { Schema, model } from "mongoose";
import AutoIncrementFactory from "mongoose-sequence";
import { getCreatedOn } from "../../constants.mjs";
const AutoIncrement = AutoIncrementFactory(mongoose.connection);

const LabBooking = new Schema({
  labNo: { type: Number, unique: true },
  consultant: { type: String, required: true },
  consultantId: { type: mongoose.ObjectId, required: true },
  party: { type: String, required: true },
  partyId: { type: mongoose.ObjectId, required: true },
  mrNo: { type: String, required: true },
  labFrom: { type: String, required: true },
  shiftNo: { type: String, required: true },
  remarks: { type: String },
  isDeletedAll: { type: Boolean, default: false },
  isRemain: { type: Boolean, default: false },
  createdUser: { type: String, required: true },
  createdOn: { type: String, default: getCreatedOn() },
  updatedUser: { type: String },
  updatedOn: { type: String },
  labDetails: [
    {
      testName: { type: String },
      testId: { type: mongoose.ObjectId },
      isDeleted: { type: Boolean, default: false },
      isDeletedOn: { type: String },
      isRefund: { type: Boolean, default: false },
      isRefundOn: { type: String },
      isDeletedUser: { type: String },
      isRefundUser: { type: String },
      amount: { type: Number },
      charges: { type: Number },
    },
  ],
});

LabBooking.plugin(AutoIncrement, { inc_field: "labNo" });

const LabBookingModel = model("LabBooking", LabBooking);

export { LabBookingModel };
