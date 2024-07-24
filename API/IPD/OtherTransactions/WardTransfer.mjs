import express from "express";
import moment from "moment-timezone";

import {
  AdmissionPartyModel,
  AdmissionWardModel,
} from "../../../DBRepo/IPD/PatientModel/AdmissionDetails/PartyModel.mjs";
import { IPDBedModel } from "../../../DBRepo/IPD/Masters/IPDBebModel.mjs";
import { IPDWardChargesModel } from "../../../DBRepo/IPD/Masters/WardChargesIPDModel.mjs";

const router = express.Router();

router.post("/wardChange", async (req, res) => {
  try {
    const { wardName, admissionNo, mrNo, bedNo, bedId, createdUser } = req.body;
    if (
      ![wardName, admissionNo, mrNo, bedNo, bedId, createdUser].every(Boolean)
    )
      throw new Error("ALL PARAMETERS ARE REQUIRED !!!");
    const findBed = await IPDBedModel.find({ _id: bedId });
    console.log("findBed", findBed);
    if (findBed[0]?.reserved === true)
      throw new Error("THIS  BED IS ALREADY RESERVED!!!");

    const partyName = await AdmissionPartyModel.find({
      admissionNo,
      activeOnAdmission: true,
    });
    let party = partyName[0]?.party;

    const findActiveBeds = await IPDWardChargesModel.find({ wardName, party });
    if (findActiveBeds.length < 0)
      throw new Error(
        "THIS WARD IS NOT ACTIVE ON THIS PARTY KINDLY CONTACT TO YOUR IT TEAM !!!"
      );
    const filteredData = findActiveBeds[0].bedDetails.filter((items) => {
      return items.bedId.toString() === bedId.toString();
    });

    if (filteredData[0].status === false)
      throw new Error(
        "BED IS NOT ACTIVATED ON THIS PARTY KINDLY CONTACT TO YOUR IT TEAM !!!"
      );
    const currentWard = await AdmissionWardModel.find({
      admissionNo,
      activeOnAdmission: true,
    });
    const updateCurrentWard = await AdmissionWardModel.updateOne(
      { _id: currentWard[0]?._id },
      {
        activeOnAdmission: false,
      }
    );

    const response = await AdmissionWardModel.create({
      wardName,
      bedNo,
      admissionNo,
      bedId,
      mrNo,
      activeOnAdmission: true,
      createdUser,
      createdOn: moment(new Date())
        .tz("Asia/Karachi")
        .format("DD/MM/YYYY HH:mm:ss"),
    });

    const EmptyBed = await IPDBedModel.findOneAndUpdate(
      { admissionNo },
      {
        $set: {
          reserved: false,
          admissionNo: "",
          mrNo: "",
          party: "",
        },
      },
      { new: true }
    );

    const reserveBed = await IPDBedModel.findOneAndUpdate(
      { _id: bedId },
      {
        $set: {
          reserved: true,
          admissionNo,
          mrNo,
          party: party,
        },
      },
      { new: true }
    );

    res.status(200).send({ data: "WARD TRANSFER SUCCESSFULLY!!!" });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

export default router;
