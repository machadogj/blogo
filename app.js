var connect = require('connect'),
	http    = require('http'),
	path	= require('path');

app = connect()
	.use(connect["static"](path.join(process.cwd(), 'public')))
	.use(connect["static"](path.join(process.cwd(), 'output')));
var port = process.env.PORT || 5000;
http.createServer(app).listen(port);
console.log("started server on http://localhost:" + port);