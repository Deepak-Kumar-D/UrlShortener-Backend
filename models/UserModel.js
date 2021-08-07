import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
  fname: { type: String, required: true },
  lname: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  verified: { type: Boolean, default: false },
  token: { type: String, required: true },
});

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12);
  }
});

userSchema.methods.generateAuthToken = async function () {
  try {
    let token = jwt.sign({ _id: this.id }, "THISISASECRETKEY");
    this.token = this.token.concat({ token: token });
    await this.save();
    return token;
  } catch (error) {
    console.log(error);
  }
};

export const User = mongoose.model("User", userSchema);
