var fs = require('fs'),
    path = require('path'),
    compile = require('./compile'),
    mkdirp = require('mkdirp').sync;

var pages = fs.readdirSync(path.join(__dirname, "pages"))
  .map(function(pageFolder){
    var content = compile(path.join(__dirname, "pages", pageFolder)),
        outputPath = path.join(__dirname, "output"),
        file = path.join(outputPath, pageFolder + ".html");
    
    mkdirp(outputPath);
    
    fs.writeFileSync(file, content);
  
  });