import express, { Request, Response } from "express";
import { body } from "express-validator";
import jwt from "jsonwebtoken";
import { Password } from "../services/password";
import { User } from "../models/user";
import { BadRequestError, validateRequest } from "@ak_tickets/common";

const router = express.Router();

router.post(
  "/api/users/signin",
  [
    body("email").isEmail().withMessage("Email must be valid"),
    body("password")
      .trim()
      .notEmpty()
      .withMessage("You must supply a password"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      throw new BadRequestError("Invalid credentials");
    }

    const passwordsMatch = await Password.compare(user.password, password);

    if (!passwordsMatch) {
      throw new BadRequestError("Invalid credentials");
    }

    const userJwt = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      process.env.JWT_KEY!
    );

    req.session = {
      jwt: userJwt,
    };

    res.status(200).send(user);
  }
);

export { router as signinRouter };
