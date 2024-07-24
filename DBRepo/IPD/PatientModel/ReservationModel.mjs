import mongoose from "mongoose";
import AutoIncrementFactory from "mongoose-sequence";

const AutoIncrement = AutoIncrementFactory(mongoose.connection);

const reservation = new mongoose.Schema({
  mrNo: { type: String, required: true },
  reservationNo: { type: Number, unique: true },
  fromDate: { type: String, required: true },
  toDate: { type: String, required: true },
  consultantId: { type: mongoose.ObjectId, required: true },
  shiftNo: { type: String, required: true },
  amount: { type: String, required: true },
  AdmissionStatus: { type: Boolean, default: false },
  createdUser: { type: String, required: true },
  createdOn: { type: String, required: true },
  updatedUser: { type: String },
  updatedOn: { type: String },
});

reservation.plugin(AutoIncrement, { inc_field: "reservationNo" });

export const ReservationModel = mongoose.model("Reservation", reservation);
