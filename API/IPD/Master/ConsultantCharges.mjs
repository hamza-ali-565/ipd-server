import express, { response } from "express";
import { ConsultantChargesModel } from "../../../DBRepo/IPD/Masters/ConsultantChargesModel.mjs";
import moment from "moment";
import { ConsultantsModel } from "../../../DBRepo/General/ConsultantModel/ConsultantModel.mjs";
import {
  AdmissionPartyModel,
  AdmissionWardModel,
} from "../../../DBRepo/IPD/PatientModel/AdmissionDetails/PartyModel.mjs";

const router = express.Router();

router.post("/consultantcharges", async (req, res) => {
  try {
    const { party, wardName, updatedUser, consultantDetails } = req.body;
    if (![party, wardName, updatedUser, consultantDetails].every(Boolean))
      throw new Error("ALL PARAMETERS ARE REQUIRED");
    const idCheck = await ConsultantChargesModel.find(
      { party, wardName },
      "_id"
    );
    if (idCheck.length > 0) {
      const updateData = await ConsultantChargesModel.findOneAndUpdate(
        { _id: idCheck[0]._id },
        {
          $set: {
            party,
            wardName,
            updatedUser,
            consultantDetails,
            updatedOn: `${moment(Date.now()).format("DD/MM/YYYY HH:mm:ss")}`,
          },
        },
        { new: true }
      );
      res.status(200).send({ data1: updateData });
      return;
    }
    const consultantCharges = await ConsultantChargesModel.create({
      party,
      wardName,
      updatedUser,
      consultantDetails,
      updatedOn: `${moment(Date.now()).format("DD/MM/YYYY HH:mm:ss")}`,
    });
    res.status(200).send({ data: consultantCharges });
    return;
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

// get consultant charges
router.get("/consultantcharges", async (req, res) => {
  try {
    const { wardName, party } = req.query;
    if (![wardName, party].every(Boolean))
      throw new Error("WARD NAME & PARTY NAME IS REQUIRED !!!");
    const consultantName = await ConsultantsModel.find({}, "name");
    const consultantCharges = await ConsultantChargesModel.find(
      { wardName, party },
      "consultantDetails"
    );
    const arrangedNames = consultantName.map((item) => ({
      name: item?.name,
      charges: 0,
      status: false,
      consultantId: item?._id,
    }));
    if (consultantCharges.length <= 0) {
      res.status(200).send({ data: arrangedNames });
      return;
    }

    const consultantChargesID = consultantCharges[0].consultantDetails.map(
      (items) => items?.consultantId?.toString()
    );
    const filteredData = consultantName.filter((item) => {
      const itemId = item?._id?.toString();
      const isInclude = consultantChargesID.includes(itemId);
      return !isInclude;
    });
    const updatedData = [
      ...consultantCharges[0].consultantDetails,
      ...filteredData.map((item) => ({
        name: item.name,
        charges: 0,
        status: false,
        consultantId: item?._id.toString(),
      })),
    ];
    res.status(200).send({ data: updatedData });
    return;
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

router.get("/admissionconsultant", async (req, res) => {
  try {
    const { admissionNo, consultantId } = req.query;
    if (![admissionNo, consultantId].every(Boolean))
      throw new Error("ALL PARAMETERS ARE REQUIRED !!!");

    const party = await AdmissionPartyModel.find(
      { admissionNo, activeOnAdmission: true },
      "party"
    );

    const wardName = await AdmissionWardModel.find(
      { admissionNo, activeOnAdmission: true },
      "wardName"
    );

    const findBed = await ConsultantChargesModel.find(
      { wardName: wardName[0].wardName, party: party[0].party },
      "consultantDetails"
    );
    if (findBed.length <= 0)
      throw new Error(
        "RATES OF CONSULTANT IS NOT ACTIVATED KINDLY CONTACT TO YOUR I.T DEPARTMENT OR TYPE MANUALLY !!!"
      );
    const consultantCharges = findBed[0].consultantDetails.filter(
      (item) => item.consultantId.toString() == consultantId.toString()
    );
    res.status(200).send({ data: consultantCharges });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

export default router;
