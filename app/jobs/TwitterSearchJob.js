
var CronJob = require('cron').CronJob,
	util = require('util'),
	_util = require('underscore'),
	request = require('request'),
	querystring = require('querystring'),
	mongoose = require('mongoose'),
	SocialSearch = mongoose.model('SocialSearch'),
	SocialMention = mongoose.model('SocialMention'),
	Class = require('joose').Class,
	SocialSearchJob = require('./SocialSearchJob');

var TwitterSearchJob = module.exports = Class('TwitterSearchJob', {
	isa : SocialSearchJob,
	my : {
		has : {
			TWITTER_QUERY : '#ocupabrasil OR #protestoBR OR #protestoDF OR #protestoSP OR #protestoRJ OR #protestoBH'
		}
	},
	has : {
		cron : '0 */1 * * * *',
		source : 'twitter'
	},
	methods : {
		search : function() {
			console.log("TwitterSearchJob.search() ");
			var _self = this;
			SocialSearch.findMaxRefByTerms(_self.my.TWITTER_QUERY, _self.source, function(err, result) {
				_self.searchTwitter(result && result[0] ? result[0].maxRef : null)
			});			
		},
		searchTwitter : function(sinceId) {
			var params = {
				q : this.my.TWITTER_QUERY,
				result_type : 'recent',
				include_entities : true
			};
			if (sinceId) {
				_util.extend(params, {
					since_id : sinceId
				});
			}

			//var url = 'http://search.twitter.com/search.json?' + querystring.stringify(params);
			var url = 'https://api.twitter.com/1.1/search/tweets.json?q=' + querystring.stringify(params) + '&rpp=10&include_entities=true&result_type=mixed';
			console.log("TwitterSearchJob.searchTwitter() ");
			console.log("URL: " + url);

			var _self = this;
			request(url, function(err, response, body) {
				if (!err) {
					var res = JSON.parse(body);
					var tweets = res.results || [];
					_util.each(tweets, function(tweet) {
						_self.createSocialMention(tweet);
					});
					_self.recordSearch(_self.my.TWITTER_QUERY, tweets,
						res.since_id_str, res.max_id_str);	
				} else {
					// TODO handle
				}
			});
		},
		createSocialMention : function(tweet) {
			console.log("TwitterSearchJob.createSocialMention() ");
			var _self = this;
			var source = _self.source;
			SocialMention.findBySourceId(tweet.id_str, source, function(err, result) {
				if (err || !result) {
					var tags = ((tweet.entities || {}).hashtags || []);
					var codingMention = new SocialMention({
						source : source,
						sourceId : tweet.id_str,
						tags : _util.invoke(_util.pluck(tags, 'text'), 'toLowerCase'),
						media : _self.extractTweetMedia(tweet),
						text : tweet.text,
						permaLink : util.format('https://twitter.com/#!/%s/status/%s', tweet.from_user, tweet.id_str),
						createdAt : Date.parse(tweet.created_at),
						userId : tweet.from_user_id_str,
						userName : tweet.from_user,
						userDisplayName : tweet.from_user_name
					});
					codingMention.save(function(err) {
						if (!err) {
							_self.emitSocialMention(codingMention);
						}
					});
				}
			});
		},
		extractTweetMedia : function(tweet) {

			var media = [];
			var tweetPhoto = _util.find(tweet.media || [], function(m) {
				return m.type == 'photo';
			});
			if (tweetPhoto) {
				var sizes = tweetPhoto.sizes || {};
				var photoSize = sizes['large'] || sizes['medium'];
				console.log(util.inspect(tweetPhoto));
				console.log(util.inspect(sizes));
				media.push({
					type : 'photo',
					resolution : 'original',
					url : tweetPhoto.media_url,
					height : photoSize.h,
					width : photoSize.w
				});				
			}
			return media;
		}
	}
});
