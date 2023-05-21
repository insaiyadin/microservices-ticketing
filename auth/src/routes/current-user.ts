import express from "express";

const router = express.Router();

router.get("/api/users/currentuser", (req, res) => {
  res.send("hiho");
});

export { router as currentUserRouter };
