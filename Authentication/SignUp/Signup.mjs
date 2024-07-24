import express from "express";
import bcrypt from "bcrypt";
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
    let saltRound = 10;
    const salt = await bcrypt.genSalt(saltRound);
    let hashedPass = await bcrypt.hash(password, salt);

    const createUser = await hospitalUserModel.create({
      userId: userId.toLowerCase(),
      userName,
      password: hashedPass,
      createdOn: `${moment(Date.now()).format("DD/MM/YYYY HH:mm:ss")}`,
    });

    res.status(200).send({ data: createUser });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

export default router;
