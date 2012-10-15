
/*!
  Core Modules
 */

var belt = require('belt'),
    request = require('request'),
    querystring = require('querystring');

/*!
  Final Results
  API Base
  API Path
 */

var results = new Array(),
    base = 'http://search.twitter.com',
    path = '/search.json';

/*!
  Filter out noise based on a pattern
  @param {RegExp OR Array} pattern 
  @returns null;
*/

function filter(pattern) {
  if (belt.typeOf(pattern) !== 'regexp') {
    pattern = belt.arrayToRegExp(pattern);
  };
  for (var j = 0; j < results.length; j++) {
    var testText = results[j].text.toString();
    var match = testText.search(pattern);
    if (match !== -1) {
      results.splice(j, 1);
      j--;
    };
  };
};

/*!
  If result does not match pattern,
  then remove that tweet from the results.
  @param {RegExp OR Array} pattern 
  @returns null;
*/

function regex(pattern) {
  if (belt.typeOf(pattern) !== 'regexp') {
    pattern = belt.arrayToRegExp(pattern);
  };
  for (var j = 0; j < results.length; j++) {
    var testText = results[j].text.toString();
    var match = testText.search(pattern);
    if (match === -1) {
      results.splice(j, 1);
      j--;
    };
  };
};

// search iterative
module.exports = search = function(config, callback) {
  var returnedPages = 0;
  var totalPages = 15;
  for (var currentPage = 0; currentPage < totalPages; currentPage++) {
    if (config === null) {
      callback({ message : 'config needs to be defined!' }, null, null);
      return;
    };
    // twitter search params for querystring setup
    var params = {
      q : config.query,
      rpp : 100
    };
    // setup querystring param
    if (currentPage === 0) {
      var page = base + path + '?' + querystring.stringify(params);
    } else {
      params['page'] = currentPage;
      var page = base + path + '?' + querystring.stringify(params);
    };
    request(page, function (error, response, body) {
      if (error) {
        callback(error, null, null);
        return;
      } else {
        try {
          var page = JSON.parse(body);
        } catch(e) {
          callback(e, null, null);
        }
        if (page.error) {
          callback(page.error, null, null);
        } else {
          // setup results
          for (result in page.results) {
            var tweet = page.results[result];
            results.push(tweet);
          };
          returnedPages++;
          // 15 page max, done.
          if (returnedPages === totalPages) {
            // here's where the magic begins
            // regex?
            if (config.regex) {
              if (typeof(config.regex) !== 'string') {
                regex(config.regex);
              };
            };
            // filter?
            if (config.filter) {
              filter(config.filter);
            };
            callback(null, results, results.length);
            return;
          };
        };
      };
    });
  };
};

/* EOF */