import mongoose from "mongoose";

const urlSchema = new mongoose.Schema({
  urlCode: { type: String },
  longUrl: { type: String },
  shortUrl: { type: String },
  clicks: { type: Number },
  date: { type: String, default: Date.now },
});

export const Url = mongoose.model("Url", urlSchema);
