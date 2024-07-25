import express from "express";
import { IPDWardChargesModel } from "../../../DBRepo/IPD/Masters/WardChargesIPDModel.mjs";
import moment from "moment";
import { IPDBedModel } from "../../../DBRepo/IPD/Masters/IPDBebModel.mjs";

const router = express.Router();

router.post("/ipdwardcharges", async (req, res) => {
  try {
    const { party, wardName, bedDetails, updateUser} = req.body;
    console.log("req user from middle ware", req.user);
    if (![party, wardName, updateUser, bedDetails].every(Boolean))
      throw new Error("ALL PARAMETERS ARE REQUIRED!!");
const alreadyUpdated = await IPDWardChargesModel.find({party, wardName})
    if (alreadyUpdated.length>0) {
      const updateIPD = await IPDWardChargesModel.findOneAndUpdate(
        { party, wardName},
        {
          $set: {
            party,
            wardName,
            bedDetails,
            updateUser,
            lastUpdate: `${moment(Date.now()).format("DD/MM/YYYY HH:mm:ss")}`,
          },
        },
        { new: true }
      );
      
      if (!updateIPD) {
        throw new Error("ERROR WHILE FINDIND WARD!!");
      } else if (updateIPD) {
        res.status(200).send({ updatedData: updateIPD });
        return;
      }
    }

    if (bedDetails.length <= 0) throw new Error(" BED DETAILS ARE REQUIRED!!");
    const createBedCharges = await IPDWardChargesModel.create({
      party,
      wardName,
      bedDetails,
      updateUser,
      lastUpdate: `${moment(Date.now()).format("DD/MM/YYYY HH:mm:ss")}`,
    });
    res.status(200).send({ data: createBedCharges });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

router.get("/ipdwardcharges", async (req, res) => {
  try {
    const { party, wardName } = req.query;
    console.log("query", req.query);
    if (!party || !wardName)
      throw new Error("PARTY NAME & WARD NAME IS REQUIRED!!!");
    const ipdWardCharges = await IPDWardChargesModel.find(
      { party, wardName },
      "bedDetails"
    );
    const ipdBed = await IPDBedModel.find({ wardName }, "bedNumber");
    // res.status(200).send({ data: ipdBed });
    // return;
    const transformedData = ipdBed.map((item) => ({
      bedId: item._id,
      bedNumber: item.bedNumber,
      status: false,
      bedCharges: 0,
    }));

    if (ipdWardCharges.length <= 0) {
      res.status(200).send({ data: transformedData });
    } else {
      const bedId = ipdWardCharges[0].bedDetails.map((items) =>
        items?.bedId?.toString()
      );

      console.log("bedId", bedId);

      const filteredData = ipdBed.filter((items) => {
        const itemId = items?._id.toString();
        const isIncluded = bedId.includes(itemId);
        // console.log(`Checking if bedId array includes ${itemId}:`, isIncluded);
        return !isIncluded;
      });

      const updatedData = [
        ...ipdWardCharges[0].bedDetails,
        ...filteredData.map((item) => ({
          bedNumber: item.bedNumber,
          bedCharges: 0,
          status: false,
          bedId: item?._id.toString(),
        })),
      ];

      res.status(200).send({ data: updatedData, _id: ipdWardCharges[0]._id });
      return;
    }
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

export default router;
