var express = require("express");
var exphbs = require("express-handlebars");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");

var db = require("./models");

var PORT = 3000;

var app = express();

mongoose.connect("mongodb://localhost/newsScraper", { useNewUrlParser: true });

app.get("/scrape", function(req, res){
    axios.get("https://www.nytimes.com/section/sports").then(function(response){
        var $ = cheerio.load(response.data);

        $("li article").each(function(i, element){
            var result = {};

            result.title = $(this)
                .children(".css-10wtrdb")
                .text();
            result.link = $(this)
                .children(".css-10wtrdb")
                .attr("href");

            db.Article.create(result)
                .then(function(dbArticle) {
                    console.log(dbArticle);
                }) 
                .catch(function(err){
                    console.log(err); 
                });
        });
        res.send("Scrape Completed");
    });
});

app.get("/articles", function(err, res){

    db.Article.find({})
        .then(function(dbArticle){
            res.json(dbArticle);
        })
        .catch(function(err){
            res.json(err);
        });
});

app.get("/article/:id", function(req, res){
    db.Article.findOne({_id: req.params._id})
        .populate("note")
        .then(function(dbArticle){
            res.json(dbArticle);
        })
        .catch(function(err) {
            res.json(err);
        });
});

app.post("/articles/:id", function(req, res){
    db.Note.create(req.body)
        .then(function(dbNote){
            return db.Article.findOneAndUpdate({ _id: req.params.id}, {note: dbNote._id}, {new: true});
        })
        .then(function(dbArticle){
            res.json(dbArticle);
        })
        .catch(function(err) {
            res.json(err);
        });
});

app.listen(PORT, function(){
    console.log("App Listening on port " + PORT)
});