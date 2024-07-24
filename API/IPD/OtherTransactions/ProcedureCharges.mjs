import express from "express";
import { ProcedureChargesModel } from "../../../DBRepo/IPD/OtherTransactions/RunningBillModels/ProcedureChargesModel.mjs";
import moment from "moment-timezone";

const router = express.Router();

router.post("/procedurecharges", async (req, res) => {
  try {
    const {
      admissionNo,
      mrNo,
      consultantName,
      consultantId,
      procedureName,
      amount,
      procedureDate,
      remarks,
      createdUser,
    } = req.body;
    if (
      ![
        admissionNo,
        mrNo,
        consultantName,
        consultantId,
        procedureName,
        amount,
        procedureDate,
        createdUser,
      ].every(Boolean)
    )
      throw new Error("ALL PARAMETERS ARE REQUIRED !!!");
    const response = await ProcedureChargesModel.create({
      admissionNo,
      mrNo,
      consultantName,
      consultantId,
      procedureName,
      amount,
      procedureDate: moment(procedureDate).format("DD/MM/YYYY"),
      remarks,
      createdUser,
      createdOn: moment(new Date())
        .tz("Asia/Karachi")
        .format("DD/MM/YYYY HH:mm:ss"),
    });
    res.status(200).send({ data: response });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

router.put("/procedurecharges", async (req, res) => {
  try {
    const { deletedUser, _id, admissionNo } = req.body;
    if (!deletedUser || !_id || !admissionNo)
      throw new Error("ALL PARAMETERS ARE REQUIRED !!!");
    const updateData = await ProcedureChargesModel.findOneAndUpdate(
      { _id, admissionNo },
      {
        $set: {
          deletedUser,
          deletedOn: moment(new Date())
            .tz("Asia/Karachi")
            .format("DD/MM/YYYY HH:mm:ss"),
          isDeleted: true,
        },
      },
      { new: true }
    );
    res.status(200).send({ data: updateData });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

router.get("/procedurecharges", async (req, res) => {
  try {
    const { admissionNo } = req.query;
    if (!admissionNo) throw new Error("ADMISSION NO. IS REQUIRED!!!");
    const data = await ProcedureChargesModel.find({
      admissionNo,
      isDeleted: false,
    });
    if (data.length <= 0) throw new Error("NO PROCEDURE ADDED YET !!!");
    res.status(200).send({ data: data });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

export default router;
