import mongoose from "mongoose";
import express from "express";
import {
  ConsultantsModel,
  SpecialityModel,
} from "../../../DBRepo/General/ConsultantModel/ConsultantModel.mjs";
import moment from "moment";
import { getCreatedOn } from "../../../src/constants.mjs";

const router = express.Router();

router.post("/adddoctor", async (req, res) => {
  try {
    const {
      name,
      speciality,
      pmdc,
      address,
      email,
      cnic,
      phone,
      status,
      createdUser,
      _id,
    } = req.body;
    if (![name, speciality, cnic, createdUser].every(Boolean))
      throw new Error("fields like Code, Name, Speciality, Cnic are Mendotary");
    if (_id !== "") {
      const updateConsultant = await ConsultantsModel.findOneAndUpdate(
        { _id: _id },
        {
          $set: {
            name,
            speciality,
            pmdc,
            address,
            email,
            cnic,
            phone,
            status,
            updatedUser: createdUser,
            updatedOn: getCreatedOn(),
          },
        },
        { new: true }
      );
      res.status(200).send({ data1: updateConsultant, message: "update" });
      return;
    }
    const create = await ConsultantsModel.create({
      name,
      speciality,
      pmdc,
      address,
      email,
      cnic,
      phone,
      status,
      createdUser: createdUser,
      createdOn: getCreatedOn(),
    });
    console.log("created", create);
    res.status(200).send({ data: create, message: "created" });
  } catch (error) {
    res.status(400).send({ message: `${error.message}` });
  }
});

router.get("/getconsultant", async (req, res) => {
  try {
    const { All } = req.query;
    let response;
    if (!All) {
      response = await ConsultantsModel.find({ status: true });
      res.status(200).send({ data: response });
      return;
    }
    response = await ConsultantsModel.find({});
    res.status(200).send({ data: response });
  } catch (error) {
    res.status(400).send({ message: `${error.message}` });
  }
});

router.get("/vectorconsultant", async (req, res) => {
  try {
    const { name } = req.query;
    if (!name) throw new Error("Please Enter Name");
    let response = await ConsultantsModel.find({
      name: { $regex: new RegExp(`${name}`, "i") },
    });
    if (response.length <= 0)
      throw new Error("No Consultant Found with this Name.");
    res.status(200).send({ data: response });
  } catch (error) {
    res.status(400).send({ message: `${error.message}` });
  }
});

router.post("/specialty", async (req, res) => {
  try {
    const { speciality } = req.body;
    if (!speciality) throw new Error("SPECIALITY IS REQUIRED !!!");
    const response = await SpecialityModel.create({
      speciality,
      createdUser: req?.user?.userId,
      createdOn: getCreatedOn()
    });
    res.status(200).send({data: response})
  } catch (error) {
    res.status(400).send({ message: error?.message });
  }
});

export default router;
