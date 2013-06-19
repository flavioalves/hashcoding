var express = require('express'),
    lessMiddleware = require('less-middleware');
    //less = require('less')

app.configure(function(){
    var cwd = process.cwd();
    var publicDir = cwd + '/public';
    
    app.set('views', cwd + '/app/views');
    app.set('view engine', 'jade');

    app.use(lessMiddleware({
      src      : __dirname + "/public",
      compress : true
    }));
    
    app.set('view options', {
    complexNames : true,
      layout : false
    });
    //app.use(express.compiler({
    //  src : publicDir, enable: ['less']
    //}));
    app.set('jsDirectory', '/javascripts/');
    app.set('cssDirectory', '/stylesheets/');
    app.use(express.bodyParser());
    app.use(express.cookieParser('secret'));
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(publicDir, {
    maxAge : 86400000
  }));
});

app.configure('development', function() {
  app.use(express.session({ secret : 'ocupabrasil-secret' }));
  app.use(express.errorHandler({
    dumpExceptions : true,
    showStack : true
  }));
});

var MongoStore = require('connect-mongo')(express);
app.configure('production', function() {
  app.use(express.session({
    secret : 'ocupabrasil-secret',
    store : new MongoStore({
      username : 'nodejitsu',
      password : 'd95d0a4df9d250ff920fcd10774bd4a8',
      host : 'flame.mongohq.com',
      port : 27042,
      db : 'nodejitsudb643424107809'
    })
  }));
  app.use(express.errorHandler({}));
});