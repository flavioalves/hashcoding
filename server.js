//#!/usr/bin/env node --debug

var util = require('util');
var app = module.exports = require('railway').createServer();
var port = (process.env.VMC_APP_PORT || process.env.PORT || 3000);

app.listen(port);

console.log('Railway server listening on port %s within %s environment', port, app.settings.env);

var TwitterSearchJob = require('./app/jobs/TwitterSearchJob');
new TwitterSearchJob().start();

var InstagramSearchJob = require('./app/jobs/InstagramSearchJob');
new InstagramSearchJob().start();

