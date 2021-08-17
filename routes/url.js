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

// Documents that were created on current date
router.post("/currdate", async (req, res) => {
  try {
    var newDate = new Date();
    var start = new Date(newDate.setHours(0, 0, 0));
    var end = new Date(newDate.setHours(23, 59, 59));

    const curr = await Url.find({
      date: { $gte: start, $lt: end },
    });

    res.status(200).send(curr);
  } catch (err) {
    res.status(422).json("Error");
  }
});

// Documents that were created on current month(Under contsruction)
router.post("/month", async (req, res) => {
  try {
    var newDate = new Date();
    // var start = new Date(newDate.now());
    // var end = new Date(newDate.setDate());

    // console.log(newDate.getMonth() + 1);
    // var daysInMonth = new Date(
    //   newDate.getFullYear(),
    //   newDate.getMonth() + 1,
    //   0
    // ).getDate();
    // console.log(daysInMonth);

    // var first = new Date(newDate.getFullYear(), newDate.getMonth(), 1);
    // var last = new Date(newDate.getFullYear(), newDate.getMonth() + 1, 0);

    // console.log(first);
    // console.log(last);

    var d1 = new Date("Jan 01, 2021 12:10:10"); //mm dd, yyyy hh:mm:ss
    var d2 = new Date("Dec 30, 2021 12:10:30"); //mm dd, yyyy hh:mm:ss

    // var ms = new Date(newDate.setMonth(0));
    // var me = new Date(newDate.setMonth(11));

    // const dd = newDate.getDate();
    // const mm = newDate.getMonth() + 1;
    // const yyyy = newDate.getFullYear();
    // const today = dd + "/" + mm + "/" + yyyy;

    const curr = await Url.find({
      date: { $gte: d1, $lt: d2 },
    });

    // const trial1 = await Url.aggregate([
    //   {
    //     $project: {
    //       month: { $month: "$date" },
    //     },
    //   },
    // ]);

    // console.log(dd);
    // console.log(mm);
    // console.log(yyyy);
    // console.log(today);
    // console.log(trial1);

    // const check = await Url.aggregate([
    //   { $project: { month: { $month: "$date" } } },
    // ]);
    // console.log(curr);
    res.status(200).send(curr);
  } catch (err) {
    res.status(422).json("Error");
  }
});

export { router };
