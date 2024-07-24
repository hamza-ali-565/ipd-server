import mongoose from "mongoose";

import AutoIncrementFactory from "mongoose-sequence";

const AutoIncrement = AutoIncrementFactory(mongoose.connection);

const paymentRefund = new mongoose.Schema({
  refundAgainst: { type: String, required: true }, //ok
  refundType: { type: String, required: true }, //ok
  location: { type: String, required: true }, //ok
  refundNo: { type: Number, unique: true },
  refundAmount: { type: Number, required: true }, //ok
  shiftNo: { type: String, required: true }, //ok
  againstNo: { type: String, required: true }, //ok
  mrNo: { type: String, required: true }, ///ok
  remarks: { type: String }, //ok
  createdUser: { type: String, required: true }, //ok
  createdOn: { type: String, required: true },
});

paymentRefund.plugin(AutoIncrement, { inc_field: "refundNo" });

export const PaymentRefundModal = mongoose.model(
  "PaymentRefund",
  paymentRefund
);
