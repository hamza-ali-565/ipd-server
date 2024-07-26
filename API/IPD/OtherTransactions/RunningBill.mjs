import express from "express";
import { AddServiceChargesModel } from "../../../DBRepo/IPD/OtherTransactions/RunningBillModels/AddServiceChargesModel.mjs";
import { ConsultantVisitModel } from "../../../DBRepo/IPD/OtherTransactions/RunningBillModels/ConsultantVisitModel.mjs";
import { ProcedureChargesModel } from "../../../DBRepo/IPD/OtherTransactions/RunningBillModels/ProcedureChargesModel.mjs";
import { AdmissionWardChargesModel } from "../../../DBRepo/IPD/OtherTransactions/RunningBillModels/wardChargesModel.mjs";
import { PaymentRecieptModel } from "../../../DBRepo/IPD/PaymenModels/PaymentRecieptModel.mjs";
import { PatientRegModel } from "../../../DBRepo/IPD/PatientModel/PatientRegModel.mjs";
import {
  AdmissionConsultantModel,
  AdmissionPartyModel,
  AdmissionWardModel,
} from "../../../DBRepo/IPD/PatientModel/AdmissionDetails/PartyModel.mjs";
import { AdmissionModel } from "../../../DBRepo/IPD/PatientModel/AdmissionDetails/AdmissionModel.mjs";
import { ConsultantsModel } from "../../../DBRepo/General/ConsultantModel/ConsultantModel.mjs";
import { RadiologyBookingModel } from "../../../DBRepo/Radiology/Transaction/RadiologyBookingModel.mjs";

const router = express.Router();

router.get("/runningbill", async (req, res) => {
  try {
    const { admissionNo, mrNo } = req.query;
    if (!admissionNo || !mrNo)
      throw new Error("ALL PARAMETERS ARE REQUIRED !!!");
    const patientData = await PatientRegModel.find({ MrNo: mrNo });

    const activeParty = await AdmissionPartyModel.find({
      admissionNo,
      activeOnAdmission: true,
    });

    const activeWard = await AdmissionWardModel.find({
      admissionNo,
      activeOnAdmission: true,
    });

    const activeConsultant = await AdmissionConsultantModel.find({
      admissionNo,
      activeOnAdmission: true,
    });
    const ConsultantName = await ConsultantsModel.find({
      _id: activeConsultant[0]?.consultantId,
    });
    // service Details
    const serviceChargesData = await AddServiceChargesModel.find({
      admissionNo,
    });
    const serviceFlat = serviceChargesData.flatMap(
      (item) => item.serviceDetails
    );
    const serviceCharges = serviceFlat.filter(
      (items) => items.isdeleted !== true
    );

    const radioChargesData = await RadiologyBookingModel.find({
      admissionNo,
    });
    let updatedRadiologyCharges;
    if (radioChargesData.length > 0) {
      const date = radioChargesData[0].createdOn;

      // Flatten the serviceDetails into radioFlat
      const radioFlat = radioChargesData.flatMap((item) => item.serviceDetails);

      // Filter out the items that are not deleted
      updatedRadiologyCharges = radioFlat.filter(
        (items) => items.isDeleted !== true
      );

      // Add the date to each item in radiologyCharges
    //   updatedRadiologyCharges = radiologyCharges.map((item) => ({
    //     amount: item?.amount,
    //     date: date,
    //     createdUser: item?.createdUser,
    //     serviceName: item?.serviceName,
    //     consultant: item?.consultant,
    //   }));
    }

    // consultant Visit
    const consultantVisit = await ConsultantVisitModel.find({
      admissionNo,
      isDeleted: false,
    });

    // procedure Charges
    const procedureCharges = await ProcedureChargesModel.find({
      admissionNo,
      isDeleted: false,
    });

    // Ward Charges
    const wardCharges = await AdmissionWardChargesModel.find({
      admissionNo,
      isDeleted: false,
    });

    //

    //Admission data
    const admissionData = await AdmissionModel.find({ admissionNo });
    // Deposit Details
    const reservationNo = admissionData[0]?.reservationNo; // Using optional chaining to safely access reservationNo

    let query;

    if (reservationNo) {
      // If reservationNo exists, search for either admissionNo or reservationNo
      query = {
        $or: [
          {
            paymentAgainst: "Advance Admission",
            againstNo: admissionNo,
            isDelete: false,
          },
          {
            paymentAgainst: "Against Reservation",
            againstNo: reservationNo,
            isDelete: false,
          },
        ],
      };
    } else {
      // If reservationNo does not exist, search only for admissionNo
      query = {
        paymentAgainst: "Advance Admission",
        againstNo: admissionNo,
        isDelete: false,
      };
    }

    const depositDetails = await PaymentRecieptModel.find(query);
    res.status(200).send({
      data: {
        patientData,
        activeParty,
        activeWard,
        ConsultantName,
        serviceCharges,
        radiologyCharges: updatedRadiologyCharges,
        consultantVisit,
        procedureCharges,
        wardCharges,
        admissionData,
        depositDetails: depositDetails,
      },
    });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

export default router;
