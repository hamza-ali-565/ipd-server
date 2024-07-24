import express from "express";
import path from "path";
import cors from "cors";
import cookieParser from "cookie-parser";
import * as dotenv from "dotenv";
import mongoose from "mongoose";
import Authentication from "./Routes/Authentications/Auth.mjs";
import Auth from "./Routes/Authentications/Auth.mjs";
import Prod from "./API/Product/Product.mjs";
import MainData from "./Routes/MainRoute/MainRoute.mjs";
import connectDB from "./src/db/database.mjs";

mongoose.set("strictQuery", false);

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: ["http://localhost:3000", "https://ipd-model.vercel.app"],
    credentials: true,
  })
);
app.use("/api/v1", Authentication);
app.use("/api/v1", Auth);
app.use("/api/v1", Prod);
app.use("/api/v1", MainData);

const __dirname = path.resolve();
app.use("/", express.static(path.join(__dirname, "./Frontend/build")));
app.use("*", express.static(path.join(__dirname, "./Frontend/build")));

connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
    })
})
.catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
})