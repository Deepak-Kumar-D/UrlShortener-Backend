import express from "express";
import { User } from "../models/UserModel.js";
import { Token } from "../models/TokenModel.js";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";

const passRouter = express.Router();

// Forgot Password
passRouter.post("/forgotpassword", async (request, response) => {
  const { email } = request.body;

  if (!email) {
    return response.status(422).json({ error: "Enter the Email" });
  }

  try {
    const isExist = await User.findOne({ email: email });

    if (!isExist) {
      return response.status(422).json({ error: "Email not valid!" });
    }

    let token = jwt.sign({ _id: isExist._id }, process.env.SECRET_KEY);

    const newToken = new Token({ userId: isExist._id, token: token });

    newToken.save();

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
        to: { name: ele.fname + " " + ele.lname, address: email },
        subject: "Password Reset",
        html: `<p>Hi ${ele.fname},</p>\n<h3>Click <a href="http://localhost:3000/resetpassword/${token}">here</a> to reset your account password.</h3>\n
                <p style="margin: 0;">Regards,</p>\n
                <p style="margin: 0;">Url Shortener</p>\n
                <p style="margin: 0;">India</p>`,
      };

      Transport.sendMail(mailOptions, function (error, response) {
        if (error) {
          console.log(error);
        } else {
          console.log("Password reset mail sent!");
        }
      });
    };
    sendMail(isExist);

    response.status(201).json({ message: "Email sent for Password change!" });
  } catch (error) {
    response.send(error);
  }
});

// Reset Password after verifying the token
passRouter.post("/resetPassword/:token", async (request, response) => {
  const { token } = request.params;
  const { password } = request.body;

  const verifyToken = await Token.findOne({ token: token });

  if (verifyToken) {
    const user = await User.findById({ _id: verifyToken.userId });

    user.password = password;
    await user.save();
    await verifyToken.delete();

    response.status(201).json({ message: "Password Reset Success!" });
  } else {
    response
      .status(422)
      .json({ error: "Invalid attempt!" + verifyToken + password });
  }
});

export { passRouter };
