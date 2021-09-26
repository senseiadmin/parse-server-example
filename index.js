// Example express application adding the parse-server module to expose Parse
// compatible API routes.

const express = require('express');
const ParseServer = require('parse-server').ParseServer;
const path = require('path');
const args = process.argv || [];
const test = args.some(arg => arg.includes('jasmine'));
var ParseDashboard = require('parse-dashboard');

const databaseUri = process.env.DATABASE_URI || process.env.MONGODB_URI;

if (!databaseUri) {
  console.log('DATABASE_URI not specified, falling back to localhost.');
}
const config = {
  databaseURI: databaseUri || 'mongodb+srv://parse:Password1@cluster0.am4qf.mongodb.net/test',
  cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js',
  appId: process.env.APP_ID || 'sensei_dev',
  masterKey: process.env.MASTER_KEY || 'tempk', //Add your master key here. Keep it secret!
  serverURL: process.env.SERVER_URL || 'http://localhost:1337/parse', // Don't forget to change to https if needed
  liveQuery: {
    classNames: ['Posts', 'Comments'], // List of classes to support for query subscriptions
  },
};
// Client-keys like the javascript key or the .NET key are not necessary with parse-server
// If you wish you require them, you can set them as options in the initialization above:
// javascriptKey, restAPIKey, dotNetKey, clientKey

const app = express();

// Serve static assets from the /public folder
app.use('/public', express.static(path.join(__dirname, '/public')));

// Serve the Parse API on the /parse URL prefix
const mountPath = process.env.PARSE_MOUNT || '/parse';
if (!test) {
  const api = new ParseServer(config);
  app.use(mountPath, api);
}

// Parse Server plays nicely with the rest of your web routes
app.get('/', function (req, res) {
  res.status(200).send('I dream of being a website.  Please star the parse-server repo on GitHub!');
});

// There will be a test page available on the /test path of your server url
// Remove this before launching your app
app.get('/test', function (req, res) {
  res.sendFile(path.join(__dirname, '/public/test.html'));
});

const port = process.env.PORT || 1337;
if (!test) {
  const httpServer = require('http').createServer(app);
  httpServer.listen(port, function () {
    console.log('parse-server-example running on port ' + port + '.');
  });
  // This will enable the Live Query real-time server
  ParseServer.createLiveQueryServer(httpServer);
}

// Set up parse dashboard
var dashboard = new ParseDashboard({
  "apps": [{
      "serverURL": 'https://parse-server-example-8p4hf.ondigitalocean.app/parse', // Not localhost
      "appId": 'sensei_dev',
      "masterKey": 'tempk',
      "appName": "Sensei Dev",
      "production": false
  }],
    "users": [
    {
      "user":"temi",
      "pass":"Password1"
    }
  ]
});

var dashApp = express();

// make the Parse Dashboard available at /dashboard
dashApp.use('/dashboard', dashboard);

// Parse Server plays nicely with the rest of your web routes
var httpServerDash = require('http').createServer(dashApp);
httpServerDash.listen(8080, function() {
    console.log('dashboard-server running on port 8080.');
});

module.exports = {
  app,
  config,
  dashApp
};
