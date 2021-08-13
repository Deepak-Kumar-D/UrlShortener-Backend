import express from "express";
import { User } from "../models/UserModel.js";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

const userRouter = express.Router();

userRouter.get("/signin", async (request, response) => {
  const { email, password } = request.body;

  if ((!email, !password)) {
    return response.status(422).json({ error: "Fill all the fields" });
  }

  try {
    const isExist = await User.findOne({ email: email });
    response.send(isExist);
  } catch (error) {
    response.send(error);
  }
});

userRouter.get("/test", (req, res) => {
  res.send("hello");
});

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

    const sendMail = (ele) => {
      let Transport = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          user: "dummy.mytestprofile@gmail.com",
          pass: "Dummyprofile.123",
        },
      });

      let mailOptions = {
        from: '"URL Shortener" <dummy.mytestprofile@gmail.com>',
        to: { name: ele.fname + " " + ele.lname, address: ele.email },
        subject: "Email Verification",
        html: `<p>Hi ${ele.fname},</p>\n<h3>Click <a href="http://localhost:3000/verify/${ele.token}">here</a> to verify your account.</h3>\n
        <p style="margin: 0;">Regards,</p>\n
        <p style="margin: 0;">Url Shortener</p>\n
        <p style="margin: 0;">India</p>`,
      };

      Transport.sendMail(mailOptions, function (error, response) {
        if (error) {
          console.log(error);
        } else {
          console.log("Verification mail sent!");
        }
      });
    };

    sendMail(newUser);

    response.status(201).json({ message: "User added!" });
  } catch (err) {
    response.send(err);
  }
});

userRouter.get("/verify/:token", async (request, response) => {
  const { token } = request.params;

  const user = await User.findOne({ token: token });

  if (user) {
    user.verified = true;
    await user.save();

    response.send(user);
  } else {
    response.json("User not found!");
  }
});

export { userRouter };
