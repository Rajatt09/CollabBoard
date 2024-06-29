import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import sendEmail from "../utils/sendEmail.js";
import sendMessage from "../utils/sendMessage.js";

const generateAccessToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json(new ApiError(404, "User does not exist"));
    }

    const accessToken = user.generateAccessToken();

    return { accessToken };
  } catch (error) {
    return res
      .status(500)
      .json(
        new ApiError(
          500,
          "Something went wrong while generating refresh and access token"
        )
      );
  }
};

const registerUser = async function (req, res) {
  const { email, password, phnumber } = req.body;

  console.log(req.body);
  if (
    [email, password].some((field) => field?.trim() === "") &&
    [password, phnumber].some((field) => field?.trim() === "")
  ) {
    return res.status(400).json(new ApiError(400, "All files are required"));
  }

  // Checking for valid email format using regex pattern
  const regExp = /^[a-zA-Z0-9._%+-]+@[a-z]+\.[a-z.]+$/;
  //   if (!regExp.test(email)) {
  //     throw new ApiError(400, "Invalid Email Format!");
  //   }

  try {
    let userExist;
    if (email?.trim() != "") userExist = await User.findOne({ email });
    else if (phnumber?.trim() != "")
      userExist = await User.findOne({ phnumber });

    if (userExist) {
      return res
        .status(409)
        .json(
          new ApiError(409, "User with these given credentials already exists.")
        );
    }

    const user = await User.create({
      email,
      password,
      phnumber,
    });

    const createdUser = await User.findById(user._id).select("-password");

    if (!createdUser) {
      return res
        .status(500)
        .json(
          new ApiError(
            500,
            "Something went wrong while registering the user. Please try later."
          )
        );
    }

    return res
      .status(200)
      .json(new ApiResponse(200, createdUser, "User registered successfully."));
  } catch (err) {
    console.error("error while creating user: ", err);
    return res.status(500).json(new ApiError(500, "Internal Server Error."));
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password, phnumber } = req.body;

    if (
      [email, password].some((field) => field?.trim() === "") &&
      [password, phnumber].some((field) => field?.trim() === "")
    ) {
      return res.status(400).json(new ApiError(400, "All files are required"));
    }

    let user;
    if (email?.trim() != "") user = await User.findOne({ email });
    else if (phnumber?.trim() != "") user = await User.findOne({ phnumber });

    if (!user) {
      return res.status(404).json(new ApiError(404, "User does not exists."));
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
      return res
        .status(401)
        .json(new ApiError(401, "Invalid user credentials"));
    }

    const { accessToken } = await generateAccessToken(user._id);

    const loggedInUser = await User.findById(user._id).select("-password");

    const options = {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .json(
        new ApiResponse(
          200,
          {
            user: loggedInUser,
            accessToken,
          },
          "User logged in succesfully"
        )
      );
  } catch (error) {
    console.log("error while  logging in the user => ", error);
    return res
      .status(500)
      .json(
        new ApiError(500, "Internal Server Error occured while finding user")
      );
  }
};

const logoutUser = async function (req, res) {
  try {
    const options = {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    };

    return res
      .status(200)
      .clearCookie("accessToken", options)
      .json(new ApiResponse(200, {}, "User logged Out"));
  } catch (e) {
    console.log("Logout failed with error : ", e);
    return res.status(500).json(new ApiError(500, "Failed to Log out"));
  }
};

const changePassword = async function (req, res) {
  const { newPassword } = req.body;
  console.log("change password is called: ", newPassword);

  if (!newPassword) {
    return res.status(400).json({
      error: "New password is required.",
    });
  }

  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        error: "User not found.",
      });
    }

    user.password = newPassword;
    await user.save();

    return res.status(200).json({
      message: "Password updated successfully.",
    });
  } catch (err) {
    console.error("Error while changing password: ", err);
    return res.status(500).json({
      error: "Internal server error.",
    });
  }
};

const redirectingUser = async function (req, res) {
  try {
    return res.status(200).json(new ApiResponse(200, req.user));
  } catch (e) {
    console.log("redirection to dashboard failure : ", e);
    return res
      .status(400)
      .json(new ApiError(400, "redirection to dashboard fail."));
  }
};

const getDetails = async function (req, res) {
  try {
    return res.status(200).json(new ApiResponse(200, req.user));
  } catch (e) {
    console.log("failure in user details fetching : ", e);
    return res
      .status(400)
      .json(new ApiError(400, "failure in user details fetching."));
  }
};

const sendMail = async function (req, res) {
  const { email, password, phnumber, otp } = req.body;
  let userExist;
  let error;
  if (email?.trim() != "") {
    userExist = await User.findOne({ email });
    error = "email";
  } else if (phnumber?.trim() != "") {
    userExist = await User.findOne({ phnumber });
    error = "phone no.";
  }

  if (userExist) {
    return res
      .status(409)
      .json(new ApiError(409, `User with this ${error}  already exists.`));
  }
  if (email?.trim() != "") {
    const emailData = {
      to: email,
      subject: "OTP for collabBoard.",
      text: `${otp} is your OTP for collabBoard.`,
      html: `${otp} is your OTP for collabBoard.`,
    };

    try {
      const emailResponse = await sendEmail(emailData);
      return res.status(200).json({
        status: 200,
        message: "OTP sent to your email.",
        data: emailResponse,
      });
    } catch (error) {
      console.log("Failure in sending email: ", error);
      return res
        .status(400)
        .json({ status: 400, message: "Failure in sending email" });
    }
  } else if (phnumber?.trim() != "") {
    try {
      const formattedPhNumber = `+91${phnumber.trim()}`;
      const emailResponse = await sendMessage(
        formattedPhNumber,
        `${otp} is your OTP for collabBoard.`
      );
      return res.status(200).json({
        status: 200,
        message: "OTP sent to your Phone number.",
        data: emailResponse,
      });
    } catch (error) {
      console.log("Failure in sending otp via phone no: ", error);
      return res
        .status(400)
        .json({ status: 400, message: "Failure in sending otp via phone no." });
    }
  }
};

const sendGoogleResponse = async function (req, res) {
  const { email } = req.body;

  try {
    let userExist = await User.findOne({ email });

    if (userExist) {
      return res
        .status(409)
        .json(new ApiError(409, "User with this email already exists."));
    }

    const charset =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let pass = "";
    for (let i = 0; i < 10; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      pass += charset[randomIndex];
    }

    const user = await User.create({
      email,
      password: pass,
      phnumber: "",
    });

    const { accessToken } = await generateAccessToken(user._id);

    const loggedInUser = await User.findById(user._id).select("-password");

    if (!loggedInUser) {
      return res
        .status(500)
        .json(
          new ApiError(
            500,
            "Something went wrong while registering the user. Please try later."
          )
        );
    }

    const options = {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .json(
        new ApiResponse(
          200,
          {
            user: loggedInUser,
            accessToken,
          },
          "User logged in succesfully"
        )
      );
  } catch (error) {
    console.log("error while  logging in the user => ", error);
    return res
      .status(500)
      .json(
        new ApiError(500, "Internal Server Error occured while finding user")
      );
  }
};

const sendGoogleLoginResponse = async function (req, res) {
  const { email } = req.body;

  try {
    let user = await User.findOne({ email });

    if (!user) {
      return res.status(409).json(new ApiError(409, "User does not exists."));
    }

    const { accessToken } = await generateAccessToken(user._id);

    const loggedInUser = await User.findById(user._id).select("-password");

    if (!loggedInUser) {
      return res
        .status(500)
        .json(
          new ApiError(
            500,
            "Something went wrong while login the user. Please try later."
          )
        );
    }

    const options = {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .json(
        new ApiResponse(
          200,
          {
            user: loggedInUser,
            accessToken,
          },
          "User logged in succesfully"
        )
      );
  } catch (error) {
    console.log("error while  logging in the user => ", error);
    return res
      .status(500)
      .json(
        new ApiError(500, "Internal Server Error occured while finding user")
      );
  }
};

export {
  registerUser,
  loginUser,
  logoutUser,
  redirectingUser,
  getDetails,
  sendMail,
  sendGoogleResponse,
  sendGoogleLoginResponse,
  changePassword,
};
