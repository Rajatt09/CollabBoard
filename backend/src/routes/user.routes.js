import { Router } from "express";
import {
  getDetails,
  loginUser,
  logoutUser,
  redirectingUser,
  registerUser,
  sendMail,
  sendGoogleResponse,
  sendGoogleLoginResponse,
} from "../controllers/user.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/sendMail").post(sendMail);
router.route("/googleAuth").post(sendGoogleResponse);
router.route("/googleAuth-Login").post(sendGoogleLoginResponse);

//secured routes
router.route("/redirecting").post(verifyJWT, redirectingUser);
router.route("/getDetails").get(verifyJWT, getDetails);
router.route("/logout").post(verifyJWT, logoutUser);

export default router;
