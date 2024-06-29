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
  changePassword,
} from "../controllers/user.controller.js";
import {
  addItem,
  deleteItem,
  getItems,
} from "../controllers/item.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/sendMail").post(sendMail);
router.route("/googleAuth").post(sendGoogleResponse);
router.route("/googleAuth-Login").post(sendGoogleLoginResponse);

//secured routes
router.route("/addItem").post(verifyJWT, upload.single("file"), addItem);
router.route("/getItems").get(verifyJWT, getItems);
router.route("/deleteItem/:id").post(verifyJWT, deleteItem);

router.route("/redirecting").post(verifyJWT, redirectingUser);
router.route("/getDetails").get(verifyJWT, getDetails);
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/changePassword").post(verifyJWT, changePassword);

export default router;
