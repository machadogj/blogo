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