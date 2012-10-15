
/*
  Core Modules
 */

var vows = require('vows'),
    assert = require('assert'),
    search = require('../lib/twitter-search');

/*
  Test Suite
*/

vows.describe('`twitter-search` module tests').addBatch({
  'when instantiating twitter-search':{
    topic:function() { 
      return search;
    },
    'search should be a function':function(topic){
      assert.isFunction(topic);
    },
  },
  'when performing a search without a config set':{
    topic:function() {
      search(null, this.callback);
    },
    'should have error errors':function(error, tweets, count){
      assert.isNotNull(error);
    },
    'should receive error message \'config needs to be defined!\'': function(error, tweets, count) {
      assert.equal(error.message, 'config needs to be defined!');
    },
    'tweets should be null':function(error, tweets, count) {
      assert.isNull(tweets);
    },
    'count should be null':function(error, tweets, count) {
      assert.isNull(count);
    }
  },
  'when performing a search of the twitter api':{
    topic:function(){
      var config = {
        query : 'from:nodejs',
        regex : /node|mongo/gi,
        filter : /cancer/gi
      };
      search(config, this.callback);
    },
    'we should get back no errors':function(error, tweets, count){
      assert.equal(error);
    },
    'tweets should be an object':function(error, tweets, count){
      assert.equal('object', typeof(tweets));
    },
    'count should be a number':function(error, tweets, count){
      assert.isNumber(count);
    }
  },
  'when performing a search with a noise filter that is an \'Array\' of length of more than one' : {
    topic:function() {
      var config = {
        query  : 'from:nodejs',
        regex  : /node|mongo/gi,
        filter : ['cancer', 'ingk']
      };
      search(config, this.callback);
    },
    'we should get back no errors':function(error, tweets, count) {
      assert.isNull(error);
    },
    'tweets should be an object':function(error, tweets, count) {
      assert.equal('object', typeof(tweets));
    },
    'count should be a number':function(error, tweets, count) {
      assert.isNumber(count);
    },
    'result set should not be empty':function(error, tweets, count) {
      assert.isNotNull(tweets.length);
    }
  }
}).export(module);

/* EOF */