var CronJob = require('cron').CronJob,
	util = require('util'),
	_util = require('underscore'),
	Instagram = require('instagram-node-lib'),
	mongoose = require('mongoose'),
	SocialSearch = mongoose.model('SocialSearch'),
	SocialMention = mongoose.model('SocialMention'),
	Class = require('joose').Class,
	SocialSearchJob = require('./SocialSearchJob');

var oauth = require('../../config/oauth');

var INSTAGRAM_QUERY_TAGS = ['ocupabrasil', 'protestoBR', 'protestoDF', 'protestoSP', 'protestoRJ', 'protestoBH'];

/**
 * @class InstagramSearchJob
 * @inherits SocialSearchJob
 * @author Daniel Rochetti
 */
var InstagramSearchJob = module.exports = Class('InstagramSearchJob', {
	// subclass of
	isa : SocialSearchJob,
	// static
	my : {
		has : {
			instagramResolutionMap : {
				init : {
					low_resolution : 'low',
					thumbnail : 'thumb',
					standard_resolution : 'original'
				}
			}
		}
	},
	// attributes
	has : {
		cron : '0 */1 * * * *',
		source : 'instagram'
	},
	// aop
	before : {
		search : function() {
			Instagram.set('client_id', oauth.instagram.clientId);
			Instagram.set('client_secret', oauth.instagram.clientSecret);
		}
	},
	methods : {
		search : function() {
			for (var i = 0; i < INSTAGRAM_QUERY_TAGS.length; i++) {
				this.searchRecentsByTag(INSTAGRAM_QUERY_TAGS[i]);
			}
		},
		searchRecentsByTag : function(tag) {
			var _self = this;
			SocialSearch.findMaxRefByTerms(tag, _self.source, function(err, result) {
				if (!err) {
					var lastId = result && result[0] ? result[0].maxRef : null;
					Instagram.tags.recent({
						name: tag,
						//max_tag_id : lastId,
						complete : function(data, pagination) {
							//console.log(util.inspect(pagination));
							for (var i = 0; i < data.length; i++) {
								_self.createSocialMention(data[i]);
							}								
							_self.recordSearch(tag, data,
								pagination.min_tag_id, pagination.next_max_tag_id);
						}
					});	
				}
			});
		},
		createSocialMention : function(photo) {
			var source = this.source;
			var _self = this;
			SocialMention.findBySourceId(photo.id, source, function(err, result) {
				if (err || !result) {
					var media = new Array();
					var images = photo.images;
					for (var p in images) {
						var image = images[p];
						media.push({
							type : 'photo',
							resolution : _self.my.instagramResolutionMap[p],
							url : image.url,
							height : image.height,
							width : image.width
						});	
					}
					var photoText = photo.caption ? photo.caption.text || '' : '';
					var codingMention = new SocialMention({
						source : source,
						sourceId : photo.id,
						tags : _util.invoke(photo.tags, 'toLowerCase'),
						media : media,
						text : photoText,
						permaLink : photo.link,
						createdAt : photo.created_time * 1000,
						userId : photo.user.id,
						userName : photo.user.username,
						userDisplayName : photo.user.full_name
					});
					codingMention.save(function(err) {
						if (!err) {
							_self.emitSocialMention(codingMention);
						}
					});				
				}
			});
		}
	}
});