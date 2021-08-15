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

export { router };
