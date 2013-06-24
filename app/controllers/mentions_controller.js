
var mongoose = require('mongoose'),
	seq = require('seq'),
	util = require('util'),
	_util = require('underscore'),
	SocialMention = mongoose.model('SocialMention');

load('application');

action(function index() {
	var page = req.query.page || 1;
	seq()
		.par('twitterMentions', function() {
			var pageLimit = 20;
			SocialMention.findAllOrderByRecent(SocialMention.SOURCE_TWITTER, {
				start : (page - 1) * pageLimit,
				limit : pageLimit
			}, this);
		})
		.par('instagramMentions', function() {
			var pageLimit = 5;
			SocialMention.findAllOrderByRecent(SocialMention.SOURCE_INSTAGRAM, {
				start : (page - 1) * pageLimit,
				limit : pageLimit
			}, this);
		})
		.seq(function() {
			var mentions = this.vars['twitterMentions'];
			var instagramMentions = this.vars['instagramMentions'];
			var size = instagramMentions.length;
			for (var i = 0; i < size; i++) {
				mentions.splice([i * size], 0, instagramMentions[i]);
			}
			send({
				mentions : mentions
			});
		});
});


action(function photos(){
	var page = req.query.page || 1;
	seq()	
		.par('instagramMentions', function() {
			var pageLimit = 10;
			SocialMention.findAllOrderByRecent(SocialMention.SOURCE_INSTAGRAM, {
				start : (page - 1) * pageLimit,
				limit : pageLimit
			}, this);
		})
});