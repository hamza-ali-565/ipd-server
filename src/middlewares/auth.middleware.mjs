import { hospitalUserModel } from "../../DBRepo/AuthModels/signUpModel.mjs";
import { ApiError } from "../utils/ApiError.mjs";
import { asyncHandler } from "../utils/asyncHandler.mjs";
import jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler(async (req, _, next) => {
  try {
    const token =
      req.cookies?.Token || req.header("Authorization")?.replace("Bearer ", "");

    // console.log("yaha aaya tha", req.cookies?.Token);
    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await hospitalUserModel
      .findById(decodedToken?._id)
      .select("-password");

    if (!user) {
      throw new ApiError(401, "Invalid Access Token");
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});
