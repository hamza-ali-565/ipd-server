import { ApiError } from "../../utils/ApiError.mjs";
import { asyncHandler } from "../../utils/asyncHandler.mjs";
import { ApiResponse } from "../../utils/ApiResponse.mjs";
import { ConsChargesModel } from "../../models/OPD.Models/ConsultantCharges.model.mjs";
import { getCreatedOn } from "../../constants.mjs";
import moment from "moment";

const OpdConsCharges = asyncHandler(async (req, res) => {
  const { consultantName, consultantId, party, partyId, amount } = req.body;
  console.log("req.body", req?.body);

  if (![consultantName, consultantId, party, partyId, amount].every(Boolean))
    throw new ApiError(
      400,
      "ALL PARAMETERS ARE REQUIRED EXAMPLE PARAMETERS ARE [ consultantName, consultantId, party, partyId, amount ]"
    );

  const docCheck = await ConsChargesModel.findOneAndUpdate(
    { partyId, consultantId },
    {
      $set: {
        amount,
        updatedUser: req.user?.userId,
        updatedOn: getCreatedOn(),
      },
    },
    { new: true }
  );
  console.log("DOC ", docCheck);
  if (docCheck) {
    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          { data: docCheck },
          `Charges of consultant ${consultantName} Updated on ${party}`
        )
      );
  }

  const response = await ConsChargesModel.create({
    consultantName,
    consultantId,
    party,
    partyId,
    amount,
    createdUser: req.user?.userId,
    createdOn: getCreatedOn(),
  });

  // response
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { data: response },
        `Charges of consultant ${consultantName} created on ${party}`
      )
    );
});

const FindDrCharges = asyncHandler(async (req, res) => {
  const { consultantId } = req.query;
  if (!consultantId) throw new ApiError(400, "CONSULTANT ID IS REQUIRED !!!");
  const response = await ConsChargesModel.find({ consultantId });
  if (response.length <= 0) {
    throw new ApiError(400, "DATA NOT FOUND !!!");
  }
  return res.status(200).json(new ApiResponse(200, { data: response }));
});

const FindDrChargesPartyWise = asyncHandler(async (req, res) => {
  const { consultantId, partyId } = req.query;
  if (!consultantId) throw new ApiError(400, "CONSULTANT ID IS REQUIRED !!!");
  const response = await ConsChargesModel.find({
    consultantId,
    partyId,
  }).select("amount");
  if (response.length <= 0) {
    throw new ApiError(400, "DATA NOT FOUND !!!");
  }
  return res.status(200).json(new ApiResponse(200, { data: response }));
});



export { OpdConsCharges, FindDrCharges, FindDrChargesPartyWise };
