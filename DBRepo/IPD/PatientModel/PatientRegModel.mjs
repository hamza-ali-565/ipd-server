import mongoose from "mongoose";
import AutoIncrementFactory from "mongoose-sequence";

const AutoIncrement = AutoIncrementFactory(mongoose.connection);

const patientRegSchema = new mongoose.Schema({
  MrNo: { type: Number, unique: true },
  patientType: { type: String, required: true },
  patientName: { type: String, required: true },
  ageYear: { type: Number, required: true }, // Changed to Number
  ageMonth: { type: Number, default: 0 }, // Changed to Number
  ageDay: { type: Number, default: 0 }, // Changed to Number
  relativeType: { type: String, required: true },
  relativeName: { type: String, required: true },
  gender: { type: String, required: true },
  occupation: { type: String },
  maritalStatus: { type: String, required: true },
  email: { type: String },
  cellNo: { type: String, required: true },
  cnicNo: { type: String },
  address: { type: String },
  kinName: { type: String },
  kinRelation: { type: String },
  kinCell: { type: String },
  kinCnic: { type: String },
  kinAddress: { type: String },
  kinOccupation: { type: String },
  updatedUser: { type: String, required: true },
  updatedOn: { type: String, required: true },
});

// Apply the auto-increment plugin to the schema
patientRegSchema.plugin(AutoIncrement, { inc_field: "MrNo" });

// Export the model
export const PatientRegModel = mongoose.model("PatientMRReg", patientRegSchema);
