
var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	ObjectId = Schema.ObjectId
	util = require('util');

var cloudServices = process.env.VCAP_SERVICES ?
	JSON.parse(process.env.VCAP_SERVICES) : null;

function connect() {
	if (cloudServices != null) {
		//console.log('mongo connect on cloud ' + util.inspect(cloudServices));
		var credentials = cloudServices['mongodb-1.8'][0]['credentials'];
		//console.log('mongo cloud credentials ' + util.inspect(credentials));
		var uri = util.format('mongodb://%s:%s@%s:%s/%s', credentials['username'], credentials['password'],
			credentials['hostname'], credentials['port'], credentials['db']);
		mongoose.connect(uri);
	} else {
		// mongoose.connect(process.env.MONGO_URI || 'mongodb://nodejitsu:d95d0a4df9d250ff920fcd10774bd4a8@flame.mongohq.com:27042/nodejitsudb643424107809');
		mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hashcoding');
	}
}

customSchema(function() {
	//console.log(process.env.MONGO_URI);
	//mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost/hashcoding');
	connect();

/*
	var UserSchema = new Schema({
		id : ObjectId,
		name : { type : String },
		activated : { type : Boolean },
		password : { type : String }
	});
	var User = mongoose.model('User', UserSchema);
	User.modelName = 'User';
	module.exports['User'] = User;
*/

	var SocialSearchSchema = new Schema({
		id : ObjectId,
		source : {
			type : String,
			enum : [ 'instagram', 'twitter' ]
		},
		lastRun : Date,
		terms : {
			type : String,
			index : true
		},
		minRef : {
			type : String,
			index : true
		},
		maxRef : {
			type : String,
			index : true
		},
		resultCount : Number
	});
	SocialSearchSchema.statics.findMaxRefByTerms = function(terms, source, callback) {
		this.where('terms', terms)
			.where('source', source)
			.limit(1).desc('lastRun')
			.run(callback);
	};
	var SocialSearch = mongoose.model('SocialSearch', SocialSearchSchema);
	SocialSearch.modelName = 'SocialSearch';
	module.exports['SocialSearch'] = SocialSearch;



	var SocialMentionSchema = new Schema({
		id : ObjectId,
		source : {
			type : String,
			enum : [ 'instagram', 'twitter' ]
		},
		sourceId : {
			type : String,
			index : true
		},
		userId : String,
		userName : String,
		userDisplayName : String,
		permaLink : String,
		media : [{}],
		createdAt : Number,
		text : {
			type : String,
			index : true
		},
		tags : {
			type : [String],
			index : true
		},
		metadata : { type : {} }
	});
	SocialMentionSchema.statics.SOURCE_INSTAGRAM = 'instagram';
	SocialMentionSchema.statics.SOURCE_TWITTER = 'twitter';
	//SocialMentionSchema.statics.JOB_USERS = [ 'reconnect_Job' ];
	SocialMentionSchema.statics.findBySourceId = function(id, source, callback) {
		this.findOne({
			sourceId : id,
			source : source
		}, callback);
	};
	SocialMentionSchema.statics.findAllOrderByRecent = function(source, paging, callback) {
		var condition = {};
		if (source) {
			condition['source'] = source;
		}
		this.find(condition).skip(paging.start).limit(paging.limit)
			.sort('createdAt', -1).run(callback);
	};
	/*SocialMentionSchema.virtual('isJob').get(function() {
		console.log('SocialMention.isJob');
		return SocialMention.JOB_USERS.indexOf(this.userName) > -1
			|| (this.tags || []).indexOf('job') > -1;
	});*/
	var SocialMention = mongoose.model('SocialMention', SocialMentionSchema);
	SocialMention.modelName = 'SocialMention';
	module.exports['SocialMention'] = SocialMention;

});
