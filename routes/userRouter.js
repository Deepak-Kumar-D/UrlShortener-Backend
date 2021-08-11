import express from "express";
import { User } from "../models/UserModel.js";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

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

    const sendMail = (fname, lname, email, token) => {
      let Transport = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          user: "deepak.kumard36@gmail.com",
          pass: "Karizmaaa.3611",
        },
      });

      let mailOptions = {
        from: '"URL Shortener" <deepak.kumard36@gmail.com>',
        to: { name: fname + " " + lname, address: email },
        subject: "Email Verification",
        html: `<h3>Click <a href=http://localhost:5000/verify/${token}>here</a> to verify your account.</h3>`,
      };

      Transport.sendMail(mailOptions, function (error, response) {
        if (error) {
          console.log(error);
        } else {
          console.log("Verification mail sent!");
        }
      });
    };

    sendMail(fname, lname, email, token);

    response.status(201).json({ message: "User added!" });
  } catch (err) {
    response.send(err);
  }
});

export { userRouter };
