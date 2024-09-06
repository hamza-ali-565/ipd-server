import { Schema, model } from "mongoose";

const microscopyData = new Schema({
  parentName: { type: String, required: true },
  childData: [
    {
      name: { type: String },
      createdUser: { type: String },
    },
  ],
  lastUpdateOn: { type: String },
});

export const MicroscopyDataModel = model("MicroscopyData", microscopyData);
