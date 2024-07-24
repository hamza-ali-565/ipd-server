import mongoose from "mongoose";

const hospitalUser = new mongoose.Schema({
  userId: { type: String, required: true },
  password: { type: String, required: true },
  userName: { type: String, required: true },
  Permissions: { type: Array },
  createdOn: { type: String, required: true },
});

export const hospitalUserModel = mongoose.model("Hospital User", hospitalUser);
