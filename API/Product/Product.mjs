import express, { response } from "express";
import mongoose from "mongoose";
import { hospitalUserModel } from "../../DBRepo/AuthModels/signUpModel.mjs";
import jwt from "jsonwebtoken";

const router = express.Router();

const SECRET = process.env.SECRET || "topsecret";

router.get("/product", async (req, res) => {
  try {
    console.log(req.cookies.Token);
    const token = req.cookies.Token;
    const decoded = jwt.verify(token, SECRET);
    const _id = decoded.id;
    console.log("User ID:", _id);
    const reponse = await hospitalUserModel.find({ _id }, "-password");
    console.log("response", reponse);

    res.status(200).send({ data: reponse });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});
export default router;
