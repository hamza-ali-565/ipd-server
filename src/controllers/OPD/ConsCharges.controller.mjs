import { ApiError } from "../../utils/ApiError.mjs";
import { asyncHandler } from "../../utils/asyncHandler.mjs";
import { ApiResponse } from "../../utils/ApiResponse.mjs";
import { ConsChargesModel } from "../../models/OPD.Models/ConsultantCharges.model.mjs";
import { getCreatedOn } from "../../constants.mjs";

const OpdConsCharges = asyncHandler(async (req, res) => {
  const { consultantName, consultantId, party, partyId, amount } = req.body;
  console.log("req.body", req?.body);

  if (![consultantName, consultantId, party, partyId, amount].every(Boolean))
    throw new ApiError(
      400,
      "ALL PARAMETERS ARE REQUIRED /n EXAMPLE PARAMETERS ARE [ consultantName, consultantId, party, partyId, amount ]"
    );

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

export { OpdConsCharges };
