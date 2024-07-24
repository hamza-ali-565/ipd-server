import moment from "moment";
import mongoose from "mongoose";

const IPDWardCharges = new mongoose.Schema({
  party: { type: String, required: true },
  wardName: { type: String, required: true },
  bedDetails: [
    {
      bedNumber: { type: String },
      bedId: { type: mongoose.ObjectId },
      bedCharges: { type: Number },
      status: { type: Boolean },
    },
  ],
  updateUser: { type: String, required: true },
  lastUpdate: { type: String },
});

export const IPDWardChargesModel = mongoose.model(
  "IPDWardCharges",
  IPDWardCharges
);
