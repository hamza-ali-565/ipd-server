import express from "express";
import { AddServiceChargesModel } from "../../../DBRepo/IPD/OtherTransactions/RunningBillModels/AddServiceChargesModel.mjs";
import moment from "moment-timezone";
import { AdmissionPartyModel } from "../../../DBRepo/IPD/PatientModel/AdmissionDetails/PartyModel.mjs";
import { IPDBedModel } from "../../../DBRepo/IPD/Masters/IPDBebModel.mjs";
import { serviceChargesModel } from "../../../DBRepo/IPD/Masters/IPDServiceChargesModel.mjs";
import { AdmissionModel } from "../../../DBRepo/IPD/PatientModel/AdmissionDetails/AdmissionModel.mjs";
import { serviceNameModel } from "../../../DBRepo/General/Service/ServiceModel.mjs";
import { DSChargesModel } from "../../../DBRepo/IPD/Masters/DSChargesModel.mjs";

const router = express.Router();

router.post("/internalservice", async (req, res) => {
  try {
    const { admissionNo, serviceDetails } = req.body;

    const mrInfo = await AdmissionModel.find({ admissionNo });
    const mrNo = mrInfo[0]?.mrNo;

    if (![admissionNo, mrNo, serviceDetails].every(Boolean))
      throw new Error("ALL PARAMETERS ARE REQUIRED!!!");
    if (serviceDetails.length <= 0) throw new Error("SERVICES ARE MISSING !!!");
    const response = await AddServiceChargesModel.create({
      admissionNo,
      mrNo,
      serviceDetails,
      createdOn: moment(new Date())
        .tz("Asia/Karachi")
        .format("DD/MM/YYYY HH:mm:ss"),
    });
    res.status(200).send({ data: response });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

router.put("/internalservice", async (req, res) => {
  try {
    const { _id, deletedUser } = req.body;
    if (!_id || !deletedUser) throw new Error("ALL PARAMETERS ARE REQUIRED!!!");

    const response = await AddServiceChargesModel.updateOne(
      { "serviceDetails.uniqueServiceId": _id },
      {
        $set: {
          "serviceDetails.$.isdeleted": true,
          "serviceDetails.$.deletedUser": deletedUser,
          "serviceDetails.$.deletedOn": moment(new Date())
            .tz("Asia/Karachi")
            .format("DD/MM/YYYY HH:mm:ss"),
        },
      }
    );
    res.status(200).send({ data: response });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

router.get("/internalservice", async (req, res) => {
  try {
    const { admissionNo } = req.query;
    if (!admissionNo) throw new Error("ADMISSION NO. IS REQUIRED!!!");
    const response = await AddServiceChargesModel.find(
      { admissionNo },
      "serviceDetails"
    );
    if (response.length <= 0)
      throw new Error("NO SERVICES ADDED TO THIS PATIENT!!!");
    // const filterData = response[0].
    const flatData = response.flatMap((item) => item?.serviceDetails);
    const filterData = flatData.filter((item) => item?.isdeleted !== true);
    res.status(200).send({ data: filterData });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

router.get("/allservices", async (req, res) => {
  try {
    const { admissionNo } = req.query;
    if (!admissionNo) throw new Error("ADMISSION NO. IS REQUIRED!!!");
    const party = await AdmissionPartyModel.find({
      admissionNo,
      activeOnAdmission: true,
    });
    const wardName = await IPDBedModel.find({ admissionNo, reserved: true });

    const serviceCharges = await serviceChargesModel.find({
      wardName: wardName[0].wardName,
      party: party[0].party,
      "serviceDetails.status": true,
    });
    const allServiceDetails = serviceCharges.flatMap(
      (item) => item.serviceDetails
    );

    const filterData = allServiceDetails.filter(
      (item) => item.status !== false
    );

    res.status(200).send({ data: filterData });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});
router.get("/allRadioservices", async (req, res) => {
  try {
    const { party } = req.query;
    if (!party) throw new Error("PARTY NAME IS REQUIRED!!!");

    const serviceCharges = await DSChargesModel.find({
      party: party,
      "serviceDetails.status": true,
      parentName: { $in: ["CT-SCAN", "ULTRA SOUND", "X-RAY", "MRI"] },
    });
    const allServiceDetails = serviceCharges.flatMap(
      (item) => item.serviceDetails
    );

    const filterData = allServiceDetails.filter(
      (item) => item.status !== false
    );

    res.status(200).send({ data: filterData });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});
export default router;
