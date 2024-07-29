import express, { response } from "express";
import { REAdmissionModel } from "../../../DBRepo/IPD/Discharge/REAdmissionModel.mjs";
import moment from "moment-timezone";
import {
  AdmissionPartyModel,
  AdmissionWardModel,
} from "../../../DBRepo/IPD/PatientModel/AdmissionDetails/PartyModel.mjs";
import { IPDBedModel } from "../../../DBRepo/IPD/Masters/IPDBebModel.mjs";
import { IPDWardChargesModel } from "../../../DBRepo/IPD/Masters/WardChargesIPDModel.mjs";
import { AdmissionModel } from "../../../DBRepo/IPD/PatientModel/AdmissionDetails/AdmissionModel.mjs";

const router = express.Router();

router.post("/readmission", async (req, res) => {
  try {
    const {
      reAdmissionType,
      reAdmitUser,
      admissionNo,
      mrNo,
      reason,
      wardName,
      bedNo,
      bedId,
    } = req.body;
    if (![reAdmissionType, reAdmitUser, admissionNo, mrNo].every(Boolean))
      throw new Error("ALL FIELDS ARE REQUIRED!!!");
    const checkBed = await IPDBedModel.find({ mrNo });
    if (checkBed.length > 0)
      throw new Error(
        `PATIENT ALREADY ADMITTED IN ${checkBed[0]?.wardName} ON BED NO ${checkBed[0].bedNumber}`
      );
    const response = await REAdmissionModel.create({
      reAdmissionType,
      reAdmitUser,
      admissionNo,
      mrNo,
      reason,
      reAdmitDate: moment(new Date())
        .tz("Asia/Karachi")
        .format("DD/MM/YYYY HH:mm:ss"),
    });

    const findBed = await IPDBedModel.find({ _id: bedId });
    if (findBed[0]?.reserved === true)
      throw new Error("THIS  BED IS ALREADY RESERVED!!!");

    const partyName = await AdmissionPartyModel.find({
      admissionNo,
      activeOnAdmission: true,
    });
    let party = partyName[0]?.party;

    const findActiveBeds = await IPDWardChargesModel.find({ wardName, party });
    if (findActiveBeds.length <= 0)
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

    const wardChanr = await AdmissionWardModel.create({
      wardName,
      bedNo,
      admissionNo,
      bedId,
      mrNo,
      activeOnAdmission: true,
      createdUser: reAdmitUser,
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
          party,
        },
      },
      { new: true }
    );
    if (reAdmissionType === "Correction") {
      const updateAdmission = await AdmissionModel.findOneAndUpdate(
        { admissionNo },
        { $set: { discharge: false, reAdmissionType: "Correction" } },
        { new: true }
      );
    }
    if (reAdmissionType === "On-Consultant Advice") {
      const updateAdmission2 = await AdmissionModel.findOneAndUpdate(
        { admissionNo },
        {
          $set: {
            discharge: false,
            dischargeDate: "",
            reAdmissionType: "On-Consultant Advice",
          },
        },
        { new: true }
      );
    }
    res.status(200).send({ message: response });
  } catch (error) {
    res.status(400).send({ message: error.message });
    console.log("eeroor", error);
  }
});

export default router;
