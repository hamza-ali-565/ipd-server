// import { ApiError } from "../../utils/ApiError.mjs";
// import { asyncHandler } from "../../utils/asyncHandler.mjs";

// const updateAccountDetails = asyncHandler(async(req, res) => {
//     const {fullName, email} = req.body

//     if (!fullName || !email) {
//         throw new ApiError(400, "All fields are required")
//     }

//     const user = await User.findByIdAndUpdate(
//         req.user?._id,
//         {
//             $set: {
//                 fullName,
//                 email: email
//             }
//         },
//         {new: true}
        
//     ).select("-password")

//     return res
//     .status(200)
//     .json(new ApiResponse(200, user, "Account details updated successfully"))
// });