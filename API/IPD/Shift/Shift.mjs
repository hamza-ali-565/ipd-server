import express from "express";
import { ShiftModel } from "../../../DBRepo/IPD/Shift/ShiftModel.mjs";
import moment from "moment-timezone";
import jwt from "jsonwebtoken";

const router = express.Router();
router.post("/shift", async (req, res) => {
  try {
    const { userName, userId } = req.body;
    if (!userId || !userName)
      throw new Error("UserId / UserName is required!!!");
    const statusCheck = await ShiftModel.find({ userId, status: true });
    if (statusCheck.length > 0) throw new Error("SHIFT ALREADY CREATED!!!");
    const response = await ShiftModel.create({
      userName,
      userId,
      status: true,
      createdOn: `${moment(new Date())
        .tz("Asia/Karachi")
        .format("DD/MM/YYYY HH:mm:ss")}`,
    });
    res.status(200).send({ data: response });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

router.put("/shift", async (req, res) => {
  try {
    const { _id } = req.body;
    const checkData = await ShiftModel.find({ _id });
    if (checkData[0].status === false)
      throw new Error("SHIFT IS ALREADY CLOSED!!!");
    const updateShift = await ShiftModel.findOneAndUpdate(
      { _id: _id },
      {
        $set: {
          status: false,
          endedOn: `${moment(new Date())
            .tz("Asia/Karachi")
            .format("DD/MM/YYYY HH:mm:ss")}`,
        },
      },
      { new: true }
    );
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

router.get("/shift", async (req, res) => {
  try {
    const token = req.cookies.Token;
    const decoded =  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const userId = decoded.userId;
    console.log("User iD:", decoded.userId);
    const response = await ShiftModel.find({ userId, status: true });
    res.status(200).send({ data: response });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

export default router;
