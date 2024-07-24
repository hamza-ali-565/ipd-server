import mongoose from "mongoose";

import AutoIncrementFactory from "mongoose-sequence";

const AutoIncrement = AutoIncrementFactory(mongoose.connection);

const paymentReciept = new mongoose.Schema({
  paymentType: { type: String, required: true }, //ok
  location: { type: String, required: true }, //ok
  paymentAgainst: { type: String, required: true }, //ok
  paymentNo: { type: Number, unique: true },
  amount: { type: Number, required: true }, //ok
  shiftNo: { type: String, required: true }, //ok
  againstNo: { type: String, required: true }, //ok
  mrNo: { type: String, required: true }, ///ok
  remarks: { type: String }, //ok
  createdUser: { type: String, required: true }, //ok
  createdOn: { type: String, required: true },
  isDelete: { type: Boolean, default: false },
  deleTedOn: { type: String },
});

paymentReciept.plugin(AutoIncrement, { inc_field: "paymentNo" });

export const PaymentRecieptModel = mongoose.model(
  "PaymentReciept",
  paymentReciept
);
