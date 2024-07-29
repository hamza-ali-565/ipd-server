import express from "express";
import {
  ParentModel,
  PartyModel,
} from "../../../DBRepo/General/PartyModel.mjs/Party.Model.mjs";
import { getCreatedOn } from "../../../src/constants.mjs";
import { AdmissionPartyModel } from "../../../DBRepo/IPD/PatientModel/AdmissionDetails/PartyModel.mjs";

const router = express.Router();

router.post("/partyparent", async (req, res) => {
  try {
    console.log(req.body);
    const { name, createdUser } = req.body;
    if (!name || !createdUser)
      throw new Error("ALL PARAMETERS ARE REQUIRED !!!");
    const response = await ParentModel.create({
      name: name,
      createdUser,
      createdOn: getCreatedOn(),
    });
    res.status(200).send({ data: response });
  } catch (error) {
    res.status(400).send({ message: error.message });
    console.log(error);
  }
});

router.post("/partyname", async (req, res) => {
  try {
    const { name, parent, createdUser } = req.body;
    if (![name, parent, createdUser].every(Boolean))
      throw new Error("ALL PARAMETERS ARE REQUIRED !!!");
    const trimmedName = name.trim();
    const DupCheck = await PartyModel.find({ name: trimmedName });
    if (DupCheck.length > 0) {
      throw new Error("Party Name Already Exist !!!");
    }
    const response = await PartyModel.create({
      name: trimmedName,
      parent,
      createdUser,
      createdOn: getCreatedOn(),
    });
    res.status(200).send({ data: response });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

router.get("/partyparent", async (req, res) => {
  try {
    let response = await ParentModel.find({}, "name");
    response.unshift({ name: "--" });
    res.status(200).send({ data: response });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

router.get("/party", async (req, res) => {
  try {
    const { parent } = req.query;
    if (!parent) throw new Error("PARENT NAME IS REQUIRED !!!");
    let response = await PartyModel.find({ parent });
    res.status(200).send({ data: response });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

router.get("/partyall", async (req, res) => {
  try {
    const response = await PartyModel.find({}, "name");
    res.status(200).send({ data: response });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

router.put("/partyname", async (req, res) => {
  try {
    const { name, partyId } = req?.body;

    if (!name) throw new Error("UPDATED NAME IS REQUIRED !!!");
    const trimmedName = name.trim();
    const updateMainDoc = await PartyModel.updateOne(
      { _id: partyId },
      { $set: { name: trimmedName } },
      { new: true }
    );
    // const response = await AdmissionPartyModel.updateMany(
    //   { party: trimmedName },
    //   { $set: { party: trimmedName } }
    // );
    // console.log("RESPONSE", response);
    res.status(200).send({ data: updateMainDoc });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

export default router;
