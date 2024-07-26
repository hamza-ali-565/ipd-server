import express from "express";

const router = express.Router();

router.post("/logout", (req, res) => {
  try {
    const options = {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    };
    return res
      .status(200)
      .clearCookie("Token", options)
      .send({ message: "Logout successfull" });
  } catch (error) {
    res.status(400).send({ message: error.message });
    console.log("Error", error);
  }
});

export default router;
