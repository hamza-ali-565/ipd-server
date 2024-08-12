import mongoose, { Schema, model } from "mongoose";
import AutoIncrementFactory from "mongoose-sequence";
import { getCreatedOn } from "../../constants.mjs";
import { v4 as uuidv4 } from "uuid";
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
      testCode: { type: Number },
      isDeleted: { type: Boolean, default: false },
      isDeletedUser: { type: String },
      isDeletedOn: { type: String },
      isRefund: { type: Boolean, default: false },
      isRefundUser: { type: String },
      isRefundOn: { type: String },
      amount: { type: Number },
      charges: { type: Number },
      uniqueId: { type: String, default: uuidv4 },
      resultEntry: { type: Boolean, default: false },
    },
  ],
});

LabBooking.plugin(AutoIncrement, { inc_field: "labNo" });

const LabBookingModel = model("LabBooking", LabBooking);

export { LabBookingModel };
