import express from "express";
import { ReservationModel } from "../../../DBRepo/IPD/PatientModel/ReservationModel.mjs";
import moment from "moment-timezone";
import { ShiftModel } from "../../../DBRepo/IPD/Shift/ShiftModel.mjs";
import { PatientRegModel } from "../../../DBRepo/IPD/PatientModel/PatientRegModel.mjs";
import { PaymentRecieptModel } from "../../../DBRepo/IPD/PaymenModels/PaymentRecieptModel.mjs";
import { ConsultantsModel } from "../../../DBRepo/General/ConsultantModel/ConsultantModel.mjs";

const router = express.Router();

router.post("/reservation", async (req, res) => {
  try {
    const {
      mrNo,
      fromDate,
      toDate,
      consultantId,
      shiftNo,
      amount,
      createdUser,
      shiftId,
      location,
      paymentType,
    } = req.body;

    if (
      ![
        mrNo,
        fromDate,
        toDate,
        consultantId,
        shiftNo,
        amount,
        createdUser,
        location,
        paymentType,
      ].every(Boolean)
    )
      throw new Error("ALL PARAMETERS ARE REQUIRED!!!");
    const shiftCheck = await ShiftModel.find({ _id: shiftId });
    if (shiftCheck[0].status === false)
      throw new Error(`SHIFT HAS BEEN CLOSED AT ${shiftCheck[0].endedOn}`);
    const reservedCheck = await ReservationModel.find({
      mrNo,
      AdmissionStatus: false,
    });
    if (reservedCheck.length > 0)
      throw new Error(
        `PATIENT ALREADY RESERVED WITH RESERVATION NO ${reservedCheck[0].reservationNo}`
      );
    const response = await ReservationModel.create({
      mrNo,
      fromDate,
      toDate,
      consultantId,
      shiftNo,
      amount,
      createdUser,
      createdOn: moment(new Date())
        .tz("Asia/Karachi")
        .format("DD/MM/YYYY HH:mm:ss"),
    });

    const mrNoToPatientNameMap = await PatientRegModel.find({ MrNo: mrNo });
    const consultantName = await ConsultantsModel.find({
      _id: response?.consultantId,
    });

    const updatedData = {
      reservationNo: response?.reservationNo,
      mrNo: response?.mrNo,
      fromDate: response?.fromDate,
      toDate: response?.toDate,
      consultantName: consultantName[0]?.name,
      shiftNo: response?.shiftNo,
      amount: response?.amount,
      createdUser: response?.createdUser,
      createdOn: response?.createdOn,
      patientName: mrNoToPatientNameMap[0]?.patientName,
      patientType: mrNoToPatientNameMap[0]?.patientType,
      relativeType: mrNoToPatientNameMap[0]?.relativeType,
      relativeName: mrNoToPatientNameMap[0]?.relativeName,
      ageYear: mrNoToPatientNameMap[0]?.ageYear,
      ageMonth: mrNoToPatientNameMap[0]?.ageMonth,
      ageDay: mrNoToPatientNameMap[0]?.ageDay,
      cellNo: mrNoToPatientNameMap[0]?.cellNo,
      gender: mrNoToPatientNameMap[0]?.gender,
      address: mrNoToPatientNameMap[0]?.address,
    };

    console.log(updatedData);

    const response2 = await PaymentRecieptModel.create({
      againstNo: response?.reservationNo,
      amount,
      createdUser,
      location,
      mrNo,
      paymentAgainst: "Against Reservation",
      paymentType,
      shiftNo,
      createdOn: moment(new Date())
        .tz("Asia/Karachi")
        .format("DD/MM/YYYY HH:mm:ss"),
    });
    res.status(200).send({ data: updatedData });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

router.put("/reservation", async (req, res) => {
  try {
    const { _id, consultantId, updatedUser } = req.body;
    if (!_id) throw new Error("DOCUMENT ID IS REQUIRED!!!");
    if (![consultantId, updatedUser].every(Boolean))
      throw new Error("NO DATA TO BE UPDATED !!!");
    const updateData = await ReservationModel.findOneAndUpdate(
      { _id: _id },
      {
        $set: {
          consultantId,
          updatedUser,
          updatedOn: moment(new Date())
            .tz("Asia/Karachi")
            .format("DD/MM/YYYY HH:mm:ss"),
        },
      },
      { new: true }
    );
    res.status(200).send({ data: updateData });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

router.get("/reservation", async (req, res) => {
  try {
    const response = await ReservationModel.find({ AdmissionStatus: false });
    if (response.length <= 0) throw new Error("NO DATA FOUND!!!");

    const mrNos = response.map((item) => item.mrNo);
    const patientDetails = await PatientRegModel.find({ MrNo: { $in: mrNos } });
    const mrNoToPatientNameMap = patientDetails.reduce((acc, patient) => {
      acc[patient?.MrNo] = {
        patientName: patient?.patientName,
        patientType: patient?.patientType,
        relativeType: patient?.relativeType,
        relativeName: patient?.relativeName,
        ageYear: patient?.ageYear,
        gender: patient?.gender,
        cellNo: patient?.cellNo,
      };
      return acc;
    }, {});

    // Step 4: Add patientName to the original response
    const updatedResponse = response.map((item) => ({
      _id: item._id,
      mrNo: item.mrNo,
      fromDate: item.fromDate,
      toDate: item.toDate,
      consultantId: item.consultantId,
      shiftNo: item.shiftNo,
      amount: item.amount,
      createdUser: item.createdUser,
      createdOn: item.createdOn,
      reservationNo: item.reservationNo,
      __v: item.__v,
      AdmissionStatus: item.AdmissionStatus,
      patientName: mrNoToPatientNameMap[item.mrNo]?.patientName,
      patientType: mrNoToPatientNameMap[item.mrNo]?.patientType,
      relativeType: mrNoToPatientNameMap[item.mrNo]?.relativeType,
      relativeName: mrNoToPatientNameMap[item.mrNo]?.relativeName,
      ageYear: mrNoToPatientNameMap[item.mrNo]?.ageYear,
      cellNo: mrNoToPatientNameMap[item.mrNo]?.cellNo,
      gender: mrNoToPatientNameMap[item.mrNo]?.gender,
    }));
    res.status(200).send({ data: updatedResponse });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

router.get("/reservationall", async (req, res) => {
  try {
    const response = await ReservationModel.find({});
    if (response.length <= 0) throw new Error("NO DATA FOUND!!!");
    const mrNos = response.map((item) => item.mrNo);
    const patientDetails = await PatientRegModel.find({ MrNo: { $in: mrNos } });
    const mrNoToPatientNameMap = patientDetails.reduce((acc, patient) => {
      acc[patient?.MrNo] = {
        patientName: patient?.patientName,
        patientType: patient?.patientType,
        relativeType: patient?.relativeType,
        relativeName: patient?.relativeName,
        ageYear: patient?.ageYear,
        ageMonth: patient?.ageMonth,
        ageDay: patient?.ageDay,
        gender: patient?.gender,
        cellNo: patient?.cellNo,
        address: patient?.address,
      };
      return acc;
    }, {});

    // Step 4: Add patientName to the original response
    const updatedResponse = response.map((item) => ({
      _id: item._id,
      mrNo: item.mrNo,
      fromDate: item.fromDate,
      toDate: item.toDate,
      consultantId: item.consultantId,
      shiftNo: item.shiftNo,
      amount: item.amount,
      createdUser: item.createdUser,
      createdOn: item.createdOn,
      reservationNo: item.reservationNo,
      __v: item.__v,
      AdmissionStatus: item.AdmissionStatus,
      patientName: mrNoToPatientNameMap[item?.mrNo]?.patientName,
      patientType: mrNoToPatientNameMap[item?.mrNo]?.patientType,
      relativeType: mrNoToPatientNameMap[item?.mrNo]?.relativeType,
      relativeName: mrNoToPatientNameMap[item?.mrNo]?.relativeName,
      ageYear: mrNoToPatientNameMap[item?.mrNo]?.ageYear,
      ageMonth: mrNoToPatientNameMap[item?.mrNo]?.ageMonth,
      ageDay: mrNoToPatientNameMap[item?.mrNo]?.ageDay,
      cellNo: mrNoToPatientNameMap[item?.mrNo]?.cellNo,
      gender: mrNoToPatientNameMap[item?.mrNo]?.gender,
      address: mrNoToPatientNameMap[item?.mrNo]?.address,
    }));
    res.status(200).send({ data: updatedResponse });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

router.get("/reservationconsultant", async (req, res) => {
  try {
    const { consultantId } = req.query;
    const response = await ConsultantsModel.find({ _id: consultantId });
    res.status(200).send({ data: response });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

router.delete("/deleteCollectionReservation", async (req, res) => {
  try {
    const response = await ReservationModel.collection.drop();
    res.status(200).send({ data: response });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

export default router;
