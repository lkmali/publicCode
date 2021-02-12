var helmet = require('helmet');
const noCache = require('nocache')
var morgan = require("morgan");
var http = require("http");
var express = require('express');        // call express
var app = express();
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const permissionsPolicy = require("permissions-policy");
var swaggerDocument = require('./api/swagger.json');
var log = require("./src/logger/winston").LOG;
// define our app using express
var bodyParser = require('body-parser');
var partials = require('express-partials');
const config = require('./config');
var core = require("./src/middleware/cors").Cors;
// Add headers
var fileUpload = require("express-fileupload");
// Initial Passport
new core().corsConfiguration(app);
// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
// Register views
app.set('view engine', 'ejs');
app.use(partials());
app.use(express.static('public'));
app.use(express.static('images'));
// 1GB limit on file upload
app.use(fileUpload({
    limits: {fileSize: 1024 * 1024 * 1024},
}));
app.use(morgan("dev"));
app.disable('x-powered-by');
app.use(helmet());
app.use(helmet.dnsPrefetchControl({allow: true}));
app.use(permissionsPolicy({
    features: {
        fullscreen: ["self"],
        vibrate: ["none"],
        syncXhr: [],
    }
}));
// Register models
require('./src/database/dbConnectionManager').setup();
require('./src/database/dbConnectionManager').initialize();


// Register routes
require('./src/middleware/routes').setup(app);

app.use(express.static('build'));

app.get('/*', function (req, res) {
    res.sendFile('/build/index.html', {root: '.'});
});

// app.get('/panel/*', (req, res) => {
//   // if (req.query.productId) {
//   //   res.cookie('productId', req.query.productId, { maxAge: 900000 })
//   // }
//   res.sendFile(path.join(__dirname, 'build/index.html'))
// });

// START THE SERVER
// =============================================================================
var options = {
    ciphers: config.server.ciphers,
    honorCipherOrder: config.server.honorCipherOrder,
    secureProtocol: config.server.secureProtocol
};

port = config.server.port;
//var server = https.createServer(options, app).listen(port);
var server = http.createServer(app).listen(port);
server.timeout = config.server.timeout;
console.log(`Server is running on port ${port}`);
log.debug(`Server is running on port ${port}`);

process.on('unhandledRejection', function (reason, p) {
    //call handler here
    console.error("uncaughtException. Something went wrong with application. Blame this ", reason)
    log.error("unhandledRejection. Something went wrong with application. Blame this ", reason);
}).on('uncaughtException', err => {
    console.error("uncaughtException. Something went wrong with application. Blame this ", err)
    log.error("uncaughtException. Something went wrong with application. Blame this ", err);
});

