var express = require("express");
var exphbs = require("express-handlebars");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");

var db = require("./models");

var PORT = 3000;

var app = express();

mongoose.connect("mongodb://localhost/newsScraper", { useNewUrlParser: true });

app.get("/scrape", function (req, res) {
    axios.get("https://www.nytimes.com/section/sports").then(function (response) {
        var $ = cheerio.load(response.data);

        var results = [];

        $("#collection-sports article.css-15cbhtu").each(function (i, element) {

            var title = $(element).children("div.css-10wtrbd").children("h2.e134j7ei0").find("a").text();

            var link = $(element).children("div.css-10wtrbd").children("h2.e134j7ei0").find("a").attr("href");

            var summary = $(element).children("div.css-10wtrbd").children("p.e134j7ei1").text();

            var image = $(element).children("figure.photo").children("a").children("img").attr("src");

            results.push({
                title: title,
                link: link,
                summary: summary,
                image: image
            });
        });
        console.log(results);
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

app.get("/article/:id", function (req, res) {
    db.Article.findOne({ _id: req.params._id })
        .populate("note")
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {
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