import express from "express";
import { serviceNameModel } from "../../../DBRepo/General/Service/ServiceModel.mjs";
import moment from "moment";
import { ParentServiceModel } from "../../../DBRepo/General/Service/ParentService.model.mjs";
import { serviceChargesModel } from "../../../DBRepo/IPD/Masters/IPDServiceChargesModel.mjs";
import { getCreatedOn } from "../../../src/constants.mjs";

const router = express.Router();

router.post("/parentservice", async (req, res) => {
  try {
    const { name, createdUser } = req.body;
    if (!name || !createdUser)
      throw new Error("ALL PARAMETERS ARE REQUIRED !!!");
    const response = await ParentServiceModel.create({
      name,
      createdUser,
      createdOn: getCreatedOn(),
    });
    res.status(200).json(response);
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

router.get("/parentservicename", async (req, res) => {
  try {
    const response = await ParentServiceModel.find({}, "name");
    response.unshift({ name: "--" });
    res.status(200).json({ data: response });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

router.post("/service", async (req, res) => {
  try {
    const { parentName, serviceName, createdUser } = req.body;
    if (![parentName, serviceName, createdUser].every(Boolean))
      throw new Error("ALL PARAMETERS ARE REQUIRED!!!");

    const response = await serviceNameModel.create({
      parentName,
      serviceName,
      createdUser,
      createdOn: getCreatedOn(),
    });

    res.status(200).send({ data: response });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

router.get("/service", async (req, res) => {
  try {
    const { parentName, valids } = req.query;
    if (!parentName) throw new Error("PARENT NAME IS REQUIRED!!");
    if (!valids) {
      const response = await serviceNameModel.find({ parentName });
      res.status(200).send({ data: response });
      return;
    }
    const response = await serviceNameModel.find({});
    res.status(200).send({ data: response });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

// parent service name
router.get("/parentservice", async (req, res) => {
  try {
    const response = await serviceNameModel.find({}, "parentName");
    if (response.length <= 0) throw new Error("NO SERVICE FOUND!!!");
    const uniqueWardNames = response.filter(
      (item, index, self) =>
        index === self.findIndex((t) => t.parentName === item.parentName)
    );
    const nameChange = uniqueWardNames.map((items) => ({
      name: items?.parentName,
      _id: items?._id,
    }));
    nameChange.unshift({ name: "--" });
    res.status(200).send({ data: nameChange });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

router.get("/radiologyservices", async (req, res) => {
  try {
    const response = await serviceNameModel.find({}, "parentName");
    if (response.length <= 0) throw new Error("NO SERVICE FOUND!!!");

    const allowedServices = ["CT-SCAN", "ULTRA SOUND", "X-RAY", "MRI"];

    const filteredServices = response.filter((service) =>
      allowedServices.includes(service.parentName)
    );

    const uniqueWardNames = filteredServices.filter(
      (item, index, self) =>
        index === self.findIndex((t) => t.parentName === item.parentName)
    );

    const nameChange = uniqueWardNames.map((items) => ({
      name: items?.parentName,
      _id: items?._id,
    }));

    nameChange.unshift({ name: "--" });
    res.status(200).send({ data: nameChange });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

router.delete("/serviceDelete", async (req, res) => {
  try {
    const response = await serviceChargesModel.collection.drop();
    res.status(200).send({ message: response });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

export default router;
