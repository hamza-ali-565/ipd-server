import express, { response } from "express";
import { hospitalUserModel } from "../../DBRepo/AuthModels/signUpModel.mjs";
import jwt from "jsonwebtoken";

const router = express.Router();

router.get("/product", async (req, res) => {
  try {
    const token = req.cookies.Token;
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const _id = decoded._id;
    console.log("User ID:", _id);
    const reponse = await hospitalUserModel.find({ _id }, "-password");
    console.log("response", reponse);

    res.status(200).send({ data: reponse });
  } catch (error) {
    res.status(400).send({ message: error.message });
    console.log("error", error);
  }
});
export default router;
