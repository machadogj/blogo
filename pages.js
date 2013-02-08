var fs = require('fs'),
    path = require('path'),
    compile = require('./compile'),
    mkdirp = require('mkdirp').sync,
    outputPath = path.join(__dirname, "output");

fs.readdirSync(path.join(__dirname, "pages"))
    .forEach(function(name){
    
        var content = compile(path.join(__dirname, "pages", name)),
            file = path.join(outputPath, name + ".html");
        
        mkdirp(outputPath);
        
        fs.writeFileSync(file, content);
      
    });