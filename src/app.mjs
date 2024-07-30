import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: ["http://localhost:3000", "https://ipd-model.vercel.app"],
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// my imports
import Authentication from "../Routes/Authentications/Auth.mjs";
import Auth from "../Routes/Authentications/Auth.mjs";
import Prod from "../API/Product/Product.mjs";
import MainData from "../Routes/MainRoute/MainRoute.mjs";
import LabRoutes from "./routes/LAB/test.routes.mjs";
import { verifyJWT } from "./middlewares/auth.middleware.mjs";
import  OPDRoutes  from "./routes/OPD/Opd.routes.mjs";

// my routes
app.use("/api/v1", Authentication);
app.use("/api/v1", Auth);
app.use("/api/v1", verifyJWT, Prod);
app.use("/api/v1", verifyJWT, MainData);
app.use("/api/v1/lab", LabRoutes);
app.use("/api/v1/opd", verifyJWT, OPDRoutes);

export { app };
