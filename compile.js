var fs = require('fs'),
    path = require('path'),
    md = require("node-markdown").Markdown,
    j = require("jade");

var markdown = {
  canCompile: function ( folder ) {
    try
    {
      var stat = fs.statSync(path.join(folder, 'index.markdown'));
      return true;
    }
    catch (err) {
      return false;
    }
  },
  compile: function ( folder ) {
    return md(fs.readFileSync(path.join(folder, 'index.markdown'), "utf8"));
  }
};

var html = {
  canCompile: function ( folder ) {
    try
    {
      var stat = fs.statSync(path.join(folder, 'index.html'));
      return true;
    }
    catch (err) {
      return false;
    }
  },
  compile: function ( folder ) {
    return fs.readFileSync(path.join(folder, 'index.html'));
  }
};

var jade = {
  canCompile: function ( folder ) {
    try
    {
      var stat = fs.statSync(path.join(folder, 'index.jade'));
      return true;
    }
    catch (err) {
      return false;
    }
  },
  compile: function ( folder ) {

    var templateContent = fs.readFileSync(path.join(folder, 'index.jade')),
        metaContent = require(path.join(folder, 'meta.json')),
        template = j.compile(templateContent, { filename:path.join(__dirname, "skin", "layout.jade"), pretty: true });

    return template(metaContent);
  
  }
};

var compilers = [markdown, html, jade];

module.exports = function ( folder ) {
  for (var i in compilers) {
    if (compilers[i].canCompile(folder)) {
      return compilers[i].compile( folder );
    }
  }
}