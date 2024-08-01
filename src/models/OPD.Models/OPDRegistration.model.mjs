import mongoose, { Schema } from "mongoose";

import AutoIncrementFactory from "mongoose-sequence";

const AutoIncrement = AutoIncrementFactory(mongoose.connection);

const opdRegistration = new Schema({
  opdNo: { type: Number, unique: true },
  mrNo: { type: String, required: true },
  partyName: { type: String, required: true },
  partyId: { type: mongoose.ObjectId, required: true },
  consultantName: { type: String, required: true },
  consultantId: { type: mongoose.ObjectId, required: true },
  paymentType: { type: String, required: true },
  location: { type: String, required: true },
  tokenNo: { type: Number, required: true },
  remarks: { type: String },
  createdUser: { type: String, required: true },
  compDate: { type: String, required: true },
  createdOn: { type: String, required: true },
  amount: { type: String, required: true },
  shiftNo: { type: String, required: true },
  isDeleted: { type: Boolean, default: false },
  deletedUser: { type: String },
  deletedOn: { type: String },
});

opdRegistration.plugin(AutoIncrement, { inc_field: "opdNo" });

export const OPDRegModel = mongoose.model("OPD Reg", opdRegistration);
