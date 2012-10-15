
var Class = require('joose').Class,
	CronJob = require('cron').CronJob,
	mongoose = require('mongoose'),
	SocialSearch = mongoose.model('SocialSearch'),
	_util = require('underscore'),
	events = require('events');

var SocialSearchJob = module.exports = Class('SocialSearchJob', {
	has : {
		job : { is : 'ro' },
		cron : { required : true },
		eventEmitter : { is : 'ro' },
		autoStart : { init : false },
		source : { }
	},
	methods : {
		start : function() {
			this.getJob().start();
		},
		search : function() {
			console.log('Should be implemented by subclasses');
		},
		createSocialMention : function() {
			console.log('Should be implemented by subclasses');
		},
		emitSocialMention : function(mention) {
			this.eventEmitter.emit('NewSocialMention', mention);
		},
		recordSearch : function(query, data, minRef, maxRef) {
			var search = new SocialSearch({
				lastRun : new Date(),
				source : this.source,
				terms : query,
				resultCount : (data || []).length,
				minRef : minRef,
				maxRef : maxRef
			});
			search.save();
		}
	},
	after : {
		initialize : function (props) {
			this.job = new CronJob({
				cronTime : this.cron,
				onTick : _util.bind(this.search, this),
				start : this.autoStart
			});
			this.eventEmitter = new events.EventEmitter();
		}
	}
});