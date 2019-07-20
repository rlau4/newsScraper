var express = require("express");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");
var logger = require("morgan");

var db = require("./models");

var PORT = process.env.PORT || 3000;

var app = express();

app.use(logger("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/Shows";
mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

app.get("/scrape", function (req, res) {
    axios.get("https://www.nytimes.com/section/sports").then(function (response) {
        var $ = cheerio.load(response.data);

        var result = {};

        $("#collection-sports li.ekkqrpp3").each(function (i, element) {

            result.title = $(element).children("article.css-15cbhtu").children("div.css-10wtrbd").children("h2.e134j7ei0").find("a").text();

            result.link = "https://www.nytimes.com" + $(element).children("article.css-15cbhtu").children("div.css-10wtrbd").children("h2.e134j7ei0").find("a").attr("href");

            result.summary = $(element).children("article.css-15cbhtu").children("div.css-10wtrbd").children("p.e134j7ei1").text();

            result.img = $(element).children("article.css-15cbhtu").children("figure.photo").children("a").children("img").attr("src");

            db.Article.create(result)
                .then(function (dbArticle) {
                    // View the added result in the console
                    console.log(dbArticle);
                })
                .catch(function (err) {
                    // If an error occurred, log it
                    console.log(err);
                });

        });
    });
    res.send("Scrape Completed");
});

app.get("/articles", function (err, res) {

    db.Article.find({})
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {
            res.json(err);
        });
});

app.get("/articles/:id", function(req, res) {
    
    db.Article.findOne({ _id: req.params.id })
    
      .populate("note")
      .then(function(dbArticle) {
        // If we were able to successfully find an Article with the given id, send it back to the client
        res.json(dbArticle);
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });

app.post("/articles/:id", function (req, res) {
    db.Note.create(req.body)
        .then(function (dbNote) {
            return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
        })
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {
            res.json(err);
        });
});

app.listen(PORT, function () {
    console.log("App Listening on port " + PORT)
});