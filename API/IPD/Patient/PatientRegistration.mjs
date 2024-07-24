import express from "express";
import { PatientRegModel } from "../../../DBRepo/IPD/PatientModel/PatientRegModel.mjs";
const router = express.Router();
import moment from "moment-timezone";

router.post("/patientreg", async (req, res) => {
  try {
    const {
      MrNo,
      patientType,
      patientName,
      ageYear,
      ageDay,
      ageMonth,
      relativeType,
      gender,
      occupation,
      maritalStatus,
      email,
      cellNo,
      cnicNo,
      address,
      kinName,
      kinRelation,
      kinCell,
      kinCnic,
      kinAddress,
      kinOccupation,
      relativeName,
      updatedUser,
    } = req.body;

    // Array of required parameters
    const requiredParams = [
      "patientType",
      "patientName",
      "ageYear",
      "relativeType",
      "relativeName",
      "gender",
      "maritalStatus",
      "cellNo",
      "updatedUser",
    ];

    // Check for missing parameters
    for (const param of requiredParams) {
      if (!req.body[param]) {
        throw new Error(`${param} is missing`);
      }
    }

    if (MrNo !== "") {
      const checkMR = await PatientRegModel.find({ MrNo });
      console.log("checkMR", checkMR);
      if (checkMR.length > 0) {
        const updateData = await PatientRegModel.findOneAndUpdate(
          { MrNo: MrNo },
          {
            $set: {
              patientType,
              patientName,
              ageYear,
              ageDay,
              ageMonth,
              relativeType,
              gender,
              occupation,
              maritalStatus,
              email,
              cellNo,
              cnicNo,
              address,
              kinName,
              kinRelation,
              kinCell,
              kinCnic,
              kinAddress,
              kinOccupation,
              relativeName,
              updatedUser,
              updatedOn: `${moment(new Date())
                .tz("Asia/Karachi")
                .format("DD/MM/YYYY HH:mm:ss")}`,
            },
          },
          { new: true }
        );
        res.status(200).send({ data1: updateData });
      }
      return;
    }
    const createData = await PatientRegModel.create({
      patientType,
      patientName,
      ageYear,
      ageDay,
      ageMonth,
      relativeType,
      gender,
      occupation,
      maritalStatus,
      email,
      cellNo,
      cnicNo,
      address,
      kinName,
      kinRelation,
      kinCell,
      kinCnic,
      kinAddress,
      kinOccupation,
      relativeName,
      updatedUser,
      updatedOn: `${moment(new Date())
        .tz("Asia/Karachi")
        .format("DD/MM/YYYY HH:mm:ss")}`,
    });

    res.status(200).send({ data: createData });
  } catch (error) {
    // Send error response if any parameter is missing or other error occurs
    res.status(400).send({ message: error.message });
  }
});

router.put("/patientreg", async (req, res) => {
  try {
    const {
      MrNo,
      patientType,
      patientName,
      ageYear,
      ageDay,
      ageMonth,
      relativeType,
      gender,
      occupation,
      maritalStatus,
      email,
      cellNo,
      cnicNo,
      address,
      kinName,
      kinRelation,
      kinCell,
      kinCnic,
      kinAddress,
      kinOccupation,
      relativeName,
      updatedUser,
    } = req.body;
    console.log("req.body", maritalStatus);
    const response = await PatientRegModel.find({ MrNo });
    if (response.length <= 0)
      throw new Error("NO DATA FOUND AGAINST THIS MR NO. !!!");
    const updateMr = await PatientRegModel.findOneAndUpdate(
      { MrNo: MrNo },
      {
        $set: {
          patientType,
          patientName,
          ageYear,
          ageDay,
          ageMonth,
          relativeType,
          gender,
          occupation,
          maritalStatus,
          email,
          cellNo,
          cnicNo,
          address,
          kinName,
          kinRelation,
          kinCell,
          kinCnic,
          kinAddress,
          kinOccupation,
          relativeName,
          updatedUser,
          updatedOn: `${moment(new Date())
            .tz("Asia/Karachi")
            .format("DD/MM/YYYY HH:mm:ss")}`,
        },
      },
      { new: true }
    );
    res.status(200).send({ data: updateMr });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

router.get("/patientreg", async (req, res) => {
  try {
    const { MrNo } = req.query;

    if (!MrNo) throw new Error("MR No. IS REQUIRED!!!");

    const findData = await PatientRegModel.find({ MrNo });
    if (findData.length <= 0) throw new Error("NO DATA FOUND!!!");
    res.status(200).send({ data: findData });
    return;
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

router.get("/patientData", async (req, res) => {
  try {
    const response = await PatientRegModel.find({});
    if (response.length <= 0) throw new Error("NO DATA ENTERED YET!!!");
    res.status(200).send({ data: response });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

export default router;
