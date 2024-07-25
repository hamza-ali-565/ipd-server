import express from "express";
import { hospitalUserModel } from "../../DBRepo/AuthModels/signUpModel.mjs";
import moment from "moment";

const router = express.Router();

router.post("/signup", async (req, res) => {
  try {
    const { userName, password, userId } = req.body;
    if (![userName, password, userId].every(Boolean))
      throw new Error("ALL PARAMETERS ARE REQUIRED ⚠️");
    const duplicateCheck = await hospitalUserModel.find({ userId });
    if (duplicateCheck.length > 0)
      throw new Error("THIS USER ID ALREADY EXIST ");

    const createUser = await hospitalUserModel.create({
      userId: userId.toLowerCase(),
      userName,
      password,
      createdOn: `${moment(Date.now()).format("DD/MM/YYYY HH:mm:ss")}`,
    });

    res.status(200).send({ data: createUser });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

export default router;
