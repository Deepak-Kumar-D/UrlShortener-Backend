import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { router } from "./routes/url.js";
import { userRouter } from "./routes/userRouter.js";
import { passRouter } from "./routes/forgotPassword.js";
import dotenv from "dotenv";
dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;
const url = process.env.MONGODB_URL || "mongodb://localhost/urlshortener";

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
const con = mongoose.connection;
con.on("open", () => console.log("MongoDB is connected!"));

var corsOptions = { origin: true, credentials: true };

app.use(cors(corsOptions));
app.use(express.json());

app.use("/", router);
app.use("/", userRouter);
app.use("/", passRouter);

app.listen(PORT, () => {
  console.log(`Server connected @ ${PORT}`);
});
