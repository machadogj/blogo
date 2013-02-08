var fs = require('fs'),
    path = require('path'),
    exists = fs.existsSync || path.existsSync,
    md = require("node-markdown").Markdown,
    j = require("jade");


var compilers = {
  'markdown': function ( file ) {
    return md(fs.readFileSync(file, "utf8"));
  },
  'html': function ( file ) {
    return fs.readFileSync(path.join(file));
  },
  'jade': function ( file ) {

      var folder = path.join(file, '..');
      var templateContent = fs.readFileSync(path.join(file)),
        metaContent = require(path.join(folder, 'meta.json')),
        template = j.compile(templateContent, { filename:path.join(__dirname, "skin", "layout.jade"), pretty: true });

      return template(metaContent);
  },
};

module.exports = function ( folder, file ) {

  file = file || 'index';

  for (var i in compilers) {
    var filePath = path.join(folder, file + '.' + i);
    if (exists(filePath)) {
      return compilers[i](filePath);
    }
  }
}