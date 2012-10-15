
var mongoose = require('mongoose'),
	SocialMentionSchema = mongoose.modelSchemas['SocialMention'];
//console.log(SocialMentionSchema);
// TODO do not work here, why?
/*
SocialMentionSchema.statics.findBySourceId = function(id, source, callback) {
	this.findOne({
		sourceId : id,
		source : source
	}, callback);
};*/
//console.log(SocialMentionSchema);