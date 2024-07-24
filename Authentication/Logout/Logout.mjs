import express from "express";

const router = express.Router();

router.post("/logout", (req, res) => {
  res.cookie("Token", "", {
    maxAge: 1,
    httpOnly: true,
    sameSite: "none",
    secure: true,
  });

  res.send({ message: "Logout successfull" });
});

export default router;
