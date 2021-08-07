import mongoose, { Schema } from "mongoose";

const tokenSchema = new mongoose.Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  token: { type: String, required: true },
});

export const Token = mongoose.model("Token", tokenSchema);
