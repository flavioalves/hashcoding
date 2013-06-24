var CronJob = require('cron').CronJob,
	util = require('util'),
	_util = require('underscore'),
	request = require('request'),
	querystring = require('querystring'),
	mongoose = require('mongoose'),
	sys = require('sys'),
	SocialSearch = mongoose.model('SocialSearch'),
	SocialMention = mongoose.model('SocialMention'),
	Class = require('joose').Class,
	SocialSearchJob = require('./SocialSearchJob'),
	OAuth= require('oauth').OAuth;

	var oauthKeys = require('../../config/oauth');

	var oa = new OAuth("https://twitter.com/oauth/request_token",
                 "https://twitter.com/oauth/access_token", 
                 oauthKeys.twitter.consumerKey, oauthKeys.twitter.consumerSecret, 
                 "1.0A", "http://localhost:3000/oauth/callback", "HMAC-SHA1");
  
var TwitterSearchJob = module.exports = Class('TwitterSearchJob', {
	isa : SocialSearchJob,
	my : {
		has : {
			TWITTER_QUERY : '#ocupabrasil OR #vemprarua OR #protestoBR OR #protestoDF OR #protestoSP OR #protestoRJ OR #protestoBH'
		}
	},
	has : {
		cron : '0 */1 * * * *',
		source : 'twitter'
	},
	methods : {
		search : function() {
			//console.log("TwitterSearchJob.search() ");
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

			//var url = 'https://api.twitter.com/1.1/search/tweets.json?' + querystring.stringify(params);
			var url = 'https://api.twitter.com/1.1/search/tweets.json?q=pivotabrasil';
			var _self = this;

			oa.get(url, 
				oauthKeys.twitter.accessToken, 
				oauthKeys.twitter.accessTokenSecret, 
				function(error, data) {
					if(!error){
						var res = JSON.parse(data);
						var tweets = res.statuses || [];
						_util.each(tweets, function(tweet) {
							_self.createSocialMention(tweet);
						});
						_self.recordSearch(_self.my.TWITTER_QUERY, tweets, res.since_id_str, res.max_id_str);	
					} else {
						console.log("ERROR: when getting twitter data");
					}
				}
			);
		},

		createSocialMention : function(tweet) {
			//console.log("TwitterSearchJob.createSocialMention() " + tweet.user.screen_name);

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
						permaLink : util.format('https://twitter.com/#!/%s/status/%s', tweet.user.screen_name, tweet.id_str),
						createdAt : Date.parse(tweet.created_at),
						userId : tweet.user.id,
						userName : tweet.user.screen_name,
						userDisplayName : tweet.user.name
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
