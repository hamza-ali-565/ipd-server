import express from "express";
let router = express.Router();

import Signup from "../../Authentication/SignUp/Signup.mjs";
import Login from "../../Authentication/Login/Login.mjs";
import Logout from "../../Authentication/Logout/Logout.mjs";
import CookieCheck from "../../Authentication/CookieCheck/CookieCheck.mjs";

router.use(Signup);
router.use(Login);
router.use(Logout);
router.use(CookieCheck);

export default router;
