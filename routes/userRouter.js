import express from "express";
import { User } from "../models/UserModel.js";

const userRouter = express.Router();

userRouter.post("/signup", async (request, response) => {
  const { fname, lname, email, password } = request.body;

  if ((!fname, !lname, !email, !password)) {
    return response.status(422).json({ error: "Fill all the fields" });
  }
});
