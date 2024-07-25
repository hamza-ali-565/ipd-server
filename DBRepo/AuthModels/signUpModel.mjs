import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"

const hospitalUser = new mongoose.Schema({
  userId: { type: String, required: true },
  password: { type: String, required: true },
  userName: { type: String, required: true },
  Permissions: { type: Array },
  createdOn: { type: String, required: true },
});

// encrypt password
hospitalUser.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// passwordcheck
hospitalUser.methods.isPasswordCorrect = async function(password){
  return await bcrypt.compare(password, this.password)
}

hospitalUser.methods.generateAccessToken = function(){
  return jwt.sign(
      {
          _id: this._id,
         userId: this.userId
      },
      process.env.ACCESS_TOKEN_SECRET,
      {
          expiresIn: process.env.ACCESS_TOKEN_EXPIRY
      }
  )
}

// userSchema.methods.generateRefreshToken = function(){
//   return jwt.sign(
//       {
//           _id: this._id,

//       },
//       process.env.REFRESH_TOKEN_SECRET,
//       {
//           expiresIn: process.env.REFRESH_TOKEN_EXPIRY
//       }
//   )
// }

export const hospitalUserModel = mongoose.model("Hospital User", hospitalUser);
