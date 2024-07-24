import mongoose from "mongoose";
import AutoIncrementFactory from "mongoose-sequence";

const AutoIncrement = AutoIncrementFactory(mongoose.connection);

const createShift = new mongoose.Schema({
  userName: { type: String, required: true },
  userId: { type: String, required: true },
  ShiftNo: { type: Number, unique: true },
  createdOn: { type: String, required: true },
  status: { type: Boolean, required: true },
  endedOn: { type: String },
});

createShift.plugin(AutoIncrement, { inc_field: "ShiftNo" });

export const ShiftModel = mongoose.model("Shifts", createShift);
