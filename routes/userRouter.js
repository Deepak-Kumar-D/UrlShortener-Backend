import express from "express";
import { User } from "../models/UserModel.js";
import jwt from "jsonwebtoken";

const userRouter = express.Router();

userRouter.post("/signup", async (request, response) => {
  const { fname, lname, email, password } = request.body;

  if ((!fname, !lname, !email, !password)) {
    return response.status(422).json({ error: "Fill all the fields" });
  }

  try {
    const isExist = await User.findOne({ email: email });

    if (isExist) {
      return response.status(422).json({ error: "Email-Id already exists!" });
    }

    let token = jwt.sign({ _id: User._id }, "THISISASECRETKEY");

    const newUser = new User({ fname, lname, email, password, token });
    await newUser.save();

    response.status(201).json({ message: "User added!" });
  } catch (err) {
    response.send(err);
  }
});

export { userRouter };
