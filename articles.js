module.exporst = function () { 
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
                  article.year = article.date.getFullYear(),
                  article.month = article.date.getMonth(),
                  article.url = article.year + "/" + article.month + "/" + article.name + ".html";
                  return article;
                });

  //get the last 5 posts
  var latest = articles.sort(function(a,b){return b.date - a.date;}).slice(0,5);

  articles.forEach(function(a){
    a.latest = latest;
    
    //archive
    var year = a.year,
        month = a.month,
        url = a.url,
        outputPath = path.join(__dirname, "output", year.toString());
    
    if (! path.existsSync(outputPath)) {
      fs.mkdirSync(outputPath);
    }
    outputPath = path.join(outputPath, month.toString());
    if (! path.existsSync(outputPath)) {
      fs.mkdirSync(outputPath);
    }

    var html = articleTemplate(a),
        file = path.join(outputPath, a.name + ".html");
    fs.writeFileSync(file, html);
  });


  //index
  var indexTemplateContent = fs.readFileSync(path.join(__dirname, "skin", "index.jade")),
      indexTemplate = jade.compile(indexTemplateContent, { filename:path.join(__dirname, "skin", "layout.jade"), pretty: true });

  var html = indexTemplate({
        latest:latest,
        title: "Gustavo Machado's blog"
      }),
      file = path.join(__dirname, "output", "index.html");
  fs.writeFileSync(file, html);
}();
