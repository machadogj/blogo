
var fs = require("fs"),
  path = require("path"),
  md = require("discount"),
  jade = require("jade"),
  moment = require("moment");

var articleTemplateContent = fs.readFileSync(path.join(__dirname, "skin", "article.jade")),
    articleTemplate = jade.compile(articleTemplateContent, { pretty: true });

Date.prototype.toMoment = function(format){
  return moment(this);
};

var articles = fs.readdirSync(path.join(__dirname, "articles"))
              .map(function(articleFolder){
                var metaFile    = path.join(__dirname, "articles", articleFolder, "meta.json"),
                    contentFile = path.join(__dirname, "articles", articleFolder, "index.markdown"),
                    article     = require(metaFile);

                article.name = articleFolder;
                article.date = new Date(article.date);
                article.content = md.parse(fs.readFileSync(contentFile, "utf8"));
                return article;
              });

articles.forEach(function(a){
  // console.log("generating", a);
  var html = articleTemplate(a),
      file = path.join(__dirname, "output", a.name + ".html");
  fs.writeFileSync(file, html);
});