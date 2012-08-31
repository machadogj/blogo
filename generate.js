require('./articles');
var fs = require('fs'),
    path = require('path'),
    compile = require('./compile');

var pages = fs.readdirSync(path.join(__dirname, "pages"))
  .map(function(pageFolder){
    var content = compile(path.join(__dirname, "pages", pageFolder)),
        outputPath = path.join(__dirname, "output"),
        file = path.join(outputPath, pageFolder + ".html");
    
    if (! path.existsSync(outputPath)) {
      fs.mkdirSync(outputPath);
    }
    
    fs.writeFileSync(file, content);
  
  });


/*
var fs = require("fs"),
  path = require("path"),
  jade = require("jade"),
  moment = require("moment"),
  compile = require("./compile");

var articleTemplateContent = fs.readFileSync(path.join(__dirname, "skin", "article.jade")),
    articleTemplate = jade.compile(articleTemplateContent, { filename:path.join(__dirname, "skin", "layout.jade"), pretty: true });

Date.prototype.toMoment = function(format){
  return moment(this);
};

//articles
var articles = fs.readdirSync(path.join(__dirname, "articles"))
              .map(function(articleFolder){
                var metaFile    = path.join(__dirname, "articles", articleFolder, "meta.json"),
                    //contentFile = path.join(__dirname, "articles", articleFolder, "index.markdown"),
                    article     = require(metaFile);

                article.name = articleFolder;
                article.date = new Date(article.date);
                article.content = compile(path.join(__dirname, "articles", articleFolder));

                return article;
              });

//get the last 5 posts
var latest = articles.sort(function(a,b){return b.date - a.date;}).slice(0,5);

articles.forEach(function(a){
  a.latest = latest;
  
  //archive
  var year = a.date.getFullYear(),
      month = a.date.getMonth(),
      url = year + "/" + month + "/" + a.name + ".html",
      outputPath = path.join(__dirname, "output", year.toString());
  
  if (! path.existsSync(outputPath)) {
    fs.mkdirSync(outputPath);
  }
  outputPath = path.join(outputPath, month.toString());
  if (! path.existsSync(outputPath)) {
    fs.mkdirSync(outputPath);
  }

  //update the url.
  a.url = url;

  var html = articleTemplate(a),
      file = path.join(outputPath, a.name + ".html");
  fs.writeFileSync(file, html);
});

//pages
var pages = fs.readdirSync(path.join(__dirname, "pages"))
              .map(function(articleFolder){
                var metaFile    = path.join(__dirname, "articles", articleFolder, "meta.json"),
                    //contentFile = path.join(__dirname, "articles", articleFolder, "index.markdown"),
                    article     = require(metaFile);
*/