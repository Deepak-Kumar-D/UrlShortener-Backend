import express from "express";
import validurl from "valid-url";
import shortid from "shortid";
import { Url } from "../models/UrlModel.js";

const router = express.Router();

const baseUrl = "https://db-urlshortener.herokuapp.com/";

//Fetch urls
router.get("/getUrl", async (request, response) => {
  const url = await Url.find();
  response.send(url);
});

// Generate short URL
router.post("/shorturl", async (request, response) => {
  const { longUrl } = request.body;

  if (!validurl.isUri(baseUrl)) {
    return response.status(401).json("Invalid base URL");
  }

  const urlCode = shortid.generate();

  if (validurl.isUri(longUrl)) {
    try {
      let url = await Url.findOne({ longUrl });

      if (url) {
        response.json(url);
      } else {
        const shortUrl = baseUrl + urlCode;

        url = new Url({
          urlCode,
          longUrl,
          shortUrl,
          clicks: 0,
          date: new Date(),
        });
        await url.save();
        response.json(url);
      }
    } catch (err) {
      console.log(err);
      response.status(500).json("Server Error");
    }
  } else {
    response.status(401).json("Invalid longUrl");
  }
});

// Redirect using short URL
router.get("/:code", async (request, response) => {
  try {
    const url = await Url.findOne({ urlCode: request.params.code });

    if (url) {
      url.clicks++;
      url.save();
      response.redirect(url.longUrl);
    } else {
      return response.status(404).json("No url found!");
    }
  } catch (err) {
    console.log(err);
    response.status(500).json("Server error");
  }
});

// Cuurent Date
router.post("/currdate", async (req, res) => {
  try {
    var newDate = new Date();
    var start = new Date(newDate.setHours(0, 0, 0));
    var end = new Date(newDate.setHours(23, 59, 59));

    // var ms = new Date(newDate.setMonth(0));
    // var me = new Date(newDate.setMonth(11));

    const curr = await Url.find({
      date: { $gte: start, $lt: end },
    });

    // const mon = await Url.find({
    //   date: { $gte: ms, $lt: me },
    // });

    // const check = await Url.aggregate([
    //   { $project: { month: { $month: "$date" } } },
    // ]);

    res.status(200).send(curr);
  } catch (err) {
    response.status(422).json("Error");
  }
});

router.post("/month", async (req, res) => {
  try {
    var newDate = new Date();
    // var start = new Date(newDate.now());
    // var end = new Date(newDate.setDate());

    var d1 = new Date("Jan 01, 2021 12:10:10"); //mm dd, yyyy hh:mm:ss
    var d2 = new Date("Dec 30, 2021 12:10:30"); //mm dd, yyyy hh:mm:ss

    var ms = new Date(newDate.setMonth(0));
    var me = new Date(newDate.setMonth(11));

    const today = new Date();
    today.toLocaleString("default", { month: "long" });
    // console.log(today);

    const curr = await Url.find({
      date: { $gte: d1, $lt: d2 },
    });

    const data = await Url.aggregate([
      {
        $project: {
          date: "$date",
          year: { $year: "$date" },
          month: { $month: "$date" },
        },
      },
    ]);

    console.log(data);

    // const mon = await Url.find({
    //   date: { $gte: ms, $lt: me },
    // });

    // const check = await Url.aggregate([
    //   { $project: { month: { $month: "$date" } } },
    // ]);
    // console.log(curr);
    // res.status(200).send();
  } catch (err) {
    res.status(422).json("Error");
  }
});

export { router };
