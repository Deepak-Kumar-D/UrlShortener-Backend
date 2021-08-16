import mongoose from "mongoose";

const urlSchema = new mongoose.Schema(
  {
    userId: { type: String },
    urlCode: { type: String },
    longUrl: { type: String },
    shortUrl: { type: String },
    clicks: { type: Number },
    date: { type: String, default: Date.now },
  },
  { timestamps: true }
);

export const Url = mongoose.model("Url", urlSchema);
