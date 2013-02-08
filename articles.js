var fs = require("fs"),
  path = require("path"),
  jade = require("jade"),
  moment = require("moment"),
  compile = require("./compile"),
  mkdirp = require('mkdirp').sync;


Date.prototype.toMoment = function(format){
  return moment(this);
};

function apply( name, obj, folder, filename ) {

  var templateContent = fs.readFileSync(path.join(__dirname, "skin", name + ".jade")),
      template = jade.compile(templateContent, { filename:path.join(__dirname, "skin", "layout.jade"), pretty: true }),
      outputFolder = path.join(__dirname, "output", folder),
      outputFile = path.join(outputFolder, filename);


  var content = template(obj);
  mkdirp(outputFolder);
  
  console.log('saving article to: ' + outputFile);
  fs.writeFileSync(outputFile, content);
}

//articles
var articles = fs.readdirSync(path.join(__dirname, "articles"))
              .map(function(articleName){
                var articleFolder = path.join(__dirname, "articles", articleName),
                    metaFile    = path.join(articleFolder, "meta.json"),
                    article     = require(metaFile);

                article.name = articleName;
                article.date = new Date(article.date);
                article.content = compile(articleFolder);
                article.tldr = compile(articleFolder, "tldr");
                article.year = article.date.getFullYear(),
                article.month = article.date.getMonth() + 1,
                article.filename = article.name + ".html";
                article.folder = article.year + "/" + article.month;
                article.url = "/" + article.folder + "/" + article.filename;
                return article;
              });

//get the last 5 posts
var latest = articles.sort(function(a,b){return b.date - a.date;}).slice(0,5);

//generate each article page.
console.log("starting to generate articles");
articles.forEach(function(a){
  var folder = path.join(a.year.toString(), a.month.toString());
  a.latest = latest;

  console.log("generating: " + a.name);
  apply("article", a, a.folder, a.filename);
});
console.log("done generating articles");
console.log("------------------------");

//index
console.log("generating index.html");
apply("index", {latest: latest}, "", "index.html");

//archive
console.log("generating archive.html");
apply("archive", {latest:latest, articles: articles}, "", "archive.html");





