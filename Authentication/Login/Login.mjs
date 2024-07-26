import express from "express";
import { hospitalUserModel } from "../../DBRepo/AuthModels/signUpModel.mjs";
import bcrypt from "bcrypt";
import { ApiError } from "../../src/utils/ApiError.mjs";
import jwt from "jsonwebtoken";

const router = express.Router();

const SECRET = process.env.SECRET || "topsecret";

const generateAccessTokens = async (userId) => {
  try {
    const user = await hospitalUserModel.findById({ _id: userId });
    const accessToken = user.generateAccessToken();

    return { accessToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong while access token");
  }
};

router.post("/login", async (req, res) => {
  try {
    const { userId, password } = req.body;
    if (!userId || !password) throw new Error("BOTH PARAMETERS ARE REQUIRED!!");
    let myId = userId.toLowerCase();
    const userCheck = await hospitalUserModel.findOne({ userId: myId });
    if (userCheck.length === 0) throw new Error("USER DOES NOT EXIST!!");
    const isPasswordValid = await userCheck.isPasswordCorrect(password);
    if (!isPasswordValid) {
      throw new ApiError(401, "Invalid user credentials");
    }

    const { accessToken } = await generateAccessTokens(userCheck._id);

    const options = {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    };
    res
      .status(200)
      .cookie("Token", accessToken, options)
      .send({
        data: {
          userName: userCheck.userName,
          userId: userCheck.userId,
          token: accessToken,
        },
      });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

// const loginUser = asyncHandler(async (req, res) =>{

//   const {email, username, password} = req.body
//   console.log(email);

//   if (!username && !email) {
//       throw new ApiError(400, "username or email is required")
//   }

//   // Here is an alternative of above code based on logic discussed in video:
//   // if (!(username || email)) {
//   //     throw new ApiError(400, "username or email is required")

//   // }

//   const user = await User.findOne({
//       $or: [{username}, {email}]
//   })

//   if (!user) {
//       throw new ApiError(404, "User does not exist")
//   }

//  const isPasswordValid = await user.isPasswordCorrect(password)

//  if (!isPasswordValid) {
//   throw new ApiError(401, "Invalid user credentials")
//   }

//  const {accessToken, refreshToken} = await generateAccessAndRefereshTokens(user._id)

//   const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

//   const options = {
//       httpOnly: true,
//       secure: true
//   }

//   return res
//   .status(200)
//   .cookie("accessToken", accessToken, options)
//   .cookie("refreshToken", refreshToken, options)
//   .json(
//       new ApiResponse(
//           200,
//           {
//               user: loggedInUser, accessToken, refreshToken
//           },
//           "User logged In Successfully"
//       )
//   )

// })
export default router;
