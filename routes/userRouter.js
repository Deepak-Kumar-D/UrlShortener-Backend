import express from "express";
import { User } from "../models/UserModel.js";
import { Token } from "../models/TokenModel.js";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import bcrypt from "bcrypt";

const userRouter = express.Router();

// Regitering a user and sending a verification email with a token
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

    let token = jwt.sign({ _id: User._id }, process.env.SECRET_KEY);

    const newUser = new User({ fname, lname, email, password, token });
    await newUser.save();

    const sendMail = (ele) => {
      let Transport = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          user: process.env.MAIL_USERNAME,
          pass: process.env.MAIL_PASSWORD,
        },
      });

      let mailOptions = {
        from: '"URL Shortener"' + "<" + process.env.MAIL_USERNAME + ">",
        to: { name: ele.fname + " " + ele.lname, address: ele.email },
        subject: "Email Verification",
        html: `<p>Hi ${ele.fname},</p>\n<h3>Click <a href="https://react-urlshortener.netlify.app/verify/${ele.token}">here</a> to verify your account.</h3>\n
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

// Verifying the verification token
userRouter.get("/verify/:token", async (request, response) => {
  const { token } = request.params;

  const user = await User.findOne({ token: token });

  if (user.verified) {
    response.json("Email is already verified!");
  } else if (user) {
    user.verified = true;
    await user.save();

    response.send(user);
  } else {
    response.json("User not found!");
  }
});

// User Login
userRouter.post("/signin", async (request, response) => {
  const { email, password } = request.body;

  if ((!email, !password)) {
    return response.status(422).json({ error: "Fill all the fields" });
  }

  try {
    const isExist = await User.findOne({ email: email });
    if (isExist.verified) {
      const isMatch = await bcrypt.compare(password, isExist.password);

      if (!isMatch) {
        response.status(400).json({ error: "Invalid Credentials!" });
      } else {
        const token = jwt.sign("urlshortener", process.env.SECRET_KEY);

        response.cookie("cookietoken", token, {
          expires: new Date(Date.now() + 1800000),
          httpOnly: true,
          secure: true,
          sameSite: "none",
        });

        const newToken = new Token({ userId: isExist._id, token: token });
        newToken.save();

        response.status(200).json({ message: "Login Succesfull!" });
      }
    } else {
      response
        .status(400)
        .json({ error: "Invalid Credentials or Email not verified!" });
    }
  } catch (error) {
    response.send(error);
  }
});

//User Logout
userRouter.post("/signout", async (request, response) => {
  const cookieToken = request.cookies.cookietoken;
  await Token.findOneAndRemove({ token: cookieToken }); //Removing the cookie that was saved in the DB while signing in

  response.clearCookie("cookietoken", { path: "token" }); //Removing the cookie that was created while signing in
  response.status(200).json("Logged out successfully");
});

export { userRouter };
