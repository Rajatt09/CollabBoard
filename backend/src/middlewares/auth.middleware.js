import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const verifyJWT = async (req, res, next) => {
  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "None",
  };
  try {
    const token = req.cookies?.accessToken;

    if (!token) {
      return res
        .status(401)
        .clearCookie("accessToken", options)
        .json(new ApiError(401, "Unauthorized request"));
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id).select("-password");

    if (!user) {
      return res
        .status(401)
        .clearCookie("accessToken", options)
        .json(new ApiError(401, "Invalid Access Token"));
    }
    req.user = user;

    next();
  } catch (error) {
    return res
      .status(401)
      .clearCookie("accessToken", options)
      .json(new ApiError(401, "Invalid access token"));
  }
};
