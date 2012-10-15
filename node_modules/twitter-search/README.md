
# Twitter-Search [![Build Status](https://secure.travis-ci.org/edwardhotchkiss/twitter-search.png)](http://travis-ci.org/edwardhotchkiss/twitter-search)

> NodeJS Twitter API Search Wrapper with RegExp Filtering

### Installation

```bash
$ npm install twitter-search
```

### Twitter Search Example

```javascript
var search = require('twitter-search');

 var config = {
  query : 'from:kisshotch',
  regex : /node|mongo/gi,
  filter : ['noise', 'words'] // alternatively, filter : /noise|words/gi
};

search(config, function(error, tweets, tweetCount) {
  if (error) {
    console.error(error);
  } else {
    console.log('tweets:', tweetCount);
    console.log(tweets);
  };
});

/* EOF */
```

## Run Tests

``` bash
$ npm test
```

## License (MIT)

Copyright (c) 2011, Edward Hotchkiss.

## Author: [Edward Hotchkiss][0]

[0]: http://ingklabs.com/