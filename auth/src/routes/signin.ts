import express from "express";

const router = express.Router();

router.post("/api/users/signin", (req, res) => {
  res.send("hiho");
});

export { router as signinRouter };
