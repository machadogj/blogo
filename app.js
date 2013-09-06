var connect = require('connect'),
	http    = require('http'),
	path	= require('path');

app = connect()
	.use(connect["static"](path.join(__dirname, 'public')))
	.use(connect["static"](path.join(__dirname, 'output')));
var port = process.env.PORT || 8000;
http.createServer(app).listen(port);
console.log("started server on http://localhost:" + port);