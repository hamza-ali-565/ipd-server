import express from "express";
import { DSChargesModel } from "../../../DBRepo/IPD/Masters/DSChargesModel.mjs";
import moment from "moment";
import { serviceNameModel } from "../../../DBRepo/General/Service/ServiceModel.mjs";

const router = express.Router();

// create document
router.post("/dscharges", async (req, res) => {
  try {
    const { party, parentName, serviceDetails, updatedUser } = req.body;
    if (![party, parentName, serviceDetails, updatedUser].every(Boolean))
      throw new Error("ALL PARAMETERS ARE REQUIRED!!!");
    const idCheck = await DSChargesModel.find({ party, parentName }, "_id");
    if (idCheck.length > 0) {
      const updateData = await DSChargesModel.findOneAndUpdate(
        { _id: idCheck[0]._id },
        {
          $set: {
            party,
            parentName,
            serviceDetails,
            updatedUser,
            updatedOn: moment(Date.now()).format("DD/MM/YYYY HH:mm:ss"),
          },
        },
        { new: true }
      );
      res.status(200).send({ updatedData: updateData });
      return;
    }
    const createDSCharges = await DSChargesModel.create({
      party,
      parentName,
      serviceDetails,
      updatedUser,
      updatedOn: moment(Date.now()).format("DD/MM/YYYY HH:mm:ss"),
    });
    res.status(200).send({ data: createDSCharges });
    return;
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

// filterd Data
router.get("/dscharges", async (req, res) => {
  const { party, parentName } = req.query;
  if (![party, parentName].every(Boolean))
    throw new Error("PARTY NAME AND PARENT NAME IS REQUIRED!!!");
  const serviceName = await serviceNameModel.find(
    { parentName },
    "serviceName"
  );
  const DSData = await DSChargesModel.find(
    { party, parentName },
    "serviceDetails"
  );
  const arrangedData = serviceName.map((items) => ({
    serviceName: items?.serviceName,
    serviceId: items?._id,
    charges: 0,
    status: false,
  }));
  if (DSData.length <= 0) {
    res.status(200).send({ data: arrangedData, message: "DATA 1" });
    return;
  }
  const DSId = DSData[0]?.serviceDetails.map((items) =>
    items?.serviceId?.toString()
  );

  const filteredData = serviceName.filter((item) => {
    const nameId = item?._id?.toString();
    const isIncluded = DSId?.includes(nameId);
    return !isIncluded;
  });

  const newData = [
    ...DSData[0]?.serviceDetails,
    ...filteredData.map((item) => ({
      serviceName: item?.serviceName,
      serviceId: item?._id,
      charges: 0,
      status: false,
    })),
  ];
  res.status(200).send({ data: newData });
  return;
});
export default router;
