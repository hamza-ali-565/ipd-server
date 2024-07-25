import { ApiError } from "../../utils/ApiError.mjs";
import { asyncHandler } from "../../utils/asyncHandler.mjs";
import { ApiResponse } from "../../utils/ApiResponse.mjs";

const labTest = asyncHandler(async (req, res) => {
  const { testname, metaData } = req.body;

  if (!testname || !metaData) {
    throw new ApiError(400, "All fields are required");
  }

  // const user = await User.findByIdAndUpdate(
  //     req.user?._id,
  //     {
  //         $set: {
  //             fullName,
  //             email: email
  //         }
  //     },
  //     {new: true}

  // ).select("-password")

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { user: "hamza" },
        "Account details updated successfully"
      )
    );
});

export { labTest };
