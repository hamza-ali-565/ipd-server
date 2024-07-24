import mongoose from "mongoose";

const ParentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  createdUser: { type: String, required: true },
  createdOn: { type: String, required: true },
});

export const ParentModel = mongoose.model("Parent", ParentSchema);

const partySchema = new mongoose.Schema({
  name: { type: String, required: true },
  createdUser: { type: String, required: true },
  createdOn: { type: String, required: true },
  parent: { type: String, required: true },
});
export const PartyModel = mongoose.model("Party", partySchema);
