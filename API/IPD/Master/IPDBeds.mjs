import express from "express";
import {
  IPDBedModel,
  IPDWardModel,
} from "../../../DBRepo/IPD/Masters/IPDBebModel.mjs";
import { getCreatedOn } from "../../../src/constants.mjs";

const router = express.Router();

router.post("/ipdbeds", async (req, res) => {
  try {
    const { wardName, bedNumber, createdUser } = req.body;
    if (![wardName, bedNumber, createdUser].every(Boolean))
      throw new Error("ALL PARAMETERS ARE REQUIRED!!!");
    const ipdbed = await IPDBedModel.create({
      wardName,
      bedNumber,
      createdUser,
      createdOn: getCreatedOn(),
      admissionNo: "",
      mrNo: "",
      party: "",
      reserved: false,
    });
    res.status(200).send({ data: ipdbed });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

router.delete("/deletebeds", async (req, res) => {
  try {
    const response = await IPDBedModel.collection.drop();
    res.status(200).send({ data: response });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

router.post("/ipdward", async (req, res) => {
  try {
    const { wardName, createdUser } = req.body;
    if (![wardName, createdUser].every(Boolean))
      throw new Error("ALL PARAMETERS ARE REQUIRED!!!");
    const response = await IPDWardModel.create({
      wardName,
      createdUser,
      createdOn: getCreatedOn(),
    });
    res.status(200).send({ data: response });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

router.get("/getward", async (req, res) => {
  try {
    const response = await IPDWardModel.find({});
    const updatedData = response.map((items) => ({
      _id: items._id,
      name: items.wardName,
    }));
    updatedData.unshift({ name: "--" });
    res.status(200).send({ data: updatedData });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

router.get("/ipdbeds", async (req, res) => {
  try {
    const { wardName } = req.query;
    if (!wardName) throw new Error("WARD NAME IS REQUIRED!!!");
    const ipdbeds = await IPDBedModel.find({ wardName });
    if (ipdbeds.length <= 0) throw new Error("NO DATA FOUNND");
    res.status(200).send({ data: ipdbeds });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

router.get("/ipdward", async (req, res) => {
  try {
    const response = await IPDBedModel.find({}, "wardName");
    if (response.length <= 0) throw new Error("NO WARDS FOUND!!!");
    const uniqueWardNames = response.filter(
      (item, index, self) =>
        index === self.findIndex((t) => t.wardName === item.wardName)
    );
    const nameChange = uniqueWardNames.map((items) => ({
      name: items?.wardName,
      _id: items?._id,
    }));
    nameChange.unshift({ name: "--" });
    res.status(200).send({ data: nameChange });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

router.get("/ipdadmissionbed", async (req, res) => {
  try {
    const { wardName } = req.query;
    const response = await IPDBedModel.find({ wardName, reserved: false });
    const updatedData = response.map((item) => ({
      name: item.bedNumber,
      _id: item._id,
    }));
    updatedData.unshift({ name: "--" });
    res.status(200).send({ data: updatedData });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

router.put("/admmany", async (req, res) => {
  try {
    const response = await IPDBedModel.updateMany(
      {},
      { $set: { party: "" } },
      { new: true }
    );
    res.status(200).send({ message: "UPDATED SUCCESSFULLY", response });
  } catch (error) {
    console.log("Error");
  }
});
export default router;
