import * as dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "./src/db/database.mjs";
import { app } from "./src/app.mjs";

mongoose.set("strictQuery", false);

dotenv.config();

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
  });
