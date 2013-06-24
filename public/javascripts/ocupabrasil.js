var ocupabrasil = {

	currentPage : 1,

	sourceUrls : {
		instagram : {
			main : 'http://instagr.am',
			userProfile : 'http://statigr.am/',
			tag : 'http://statigr.am/tag/'
		},
		twitter : {
			main : 'http://twitter.com',
			userProfile : 'http://twitter.com/',
			tag : 'http://search.twitter.com/search?q=#'
		}
	},

	boxTemplate : Mustache.compile([
		'<div id="dev-social-mention-{{_id}}" class="box {{source}} col{{colSize}} {{extraClasses}}">',
			'<div class="ribbon-wrapper"><div class="ribbon">Job</div></div>',
			'{{#hasMedia}}',
				'<button class="btn expand"><i class="icon icon-zoom-in"></i>&nbsp;Expand</button>',
				'<img alt="{{text}}" src="{{mediaUrl}}"></img>',
			'{{/hasMedia}}',
			'<p class="text">{{{formattedText}}}</p>',
			'<p class="author">',
				'<abbr class="timeago" title="{{createdAtAsIsoDate}}">{{createdAtAsString}}</abbr>',
				'&nbsp;by <a>{{{usernameLink}}}</a>',
			'</p>',
			'<p class="source">',
				'<a href="{{permaLink}}" target="_blank" class="content-link">original content from</a>',
				'<a href="{{sourceUrl}}" title="{{source}}" class="content-source"></a>',
			'</p>',
		'</div>'
	].join('')),

	boxViewHelper : {
		colSize : function() {
			//var colSize = this.text.length > 137 ? 2 : 1;
			//colSize = colSize == 1 && (this.media || []).length > 0 && Math.random() > 0.25 ? 2 : colSize;
			//return colSize == 1 && Math.random() > 0.75 ? 2 : colSize
			return 1;
		},
		hasMedia : function() {
			return (this.media || []).length > 0;
		},
		createdAtAsIsoDate : function() {
			return new Date(this.createdAt).toISOString();
		},
		createdAtAsString : function() {
			return new Date(this.createdAt).toLocaleString();
		},
		formattedText : function() {
			var _f = ocupabrasil.formatter;
			var s = this.source;
			return _f.formatHashtag(_f.formatUserMention(_f.formatLink(this.text, s), s), s);
		},
		usernameLink : function() {
			return ocupabrasil.formatter.formatUserMention('@' + this.userName, this.source);
		},
		sourceUrl : function() {
			return ocupabrasil.sourceUrls[this.source].main;
		},
		mediaUrl : function() {
			return _.find(this.media || [], function(media) {
				return media.resolution == 'low';
			}).url;
		},
		extraClasses : function() {
			var classes = new Array();
			var tags = this.tags || [];
			
			// is related to job?
			var jobRelatedUsers = [ 'reconnect_Job', 'softdevjobs' ];
			if (tags.indexOf('job') != -1
				|| jobRelatedUsers.indexOf(this.userName) != -1) {
				classes.push('job');
			}
			return classes.join(' ');
		}		
	},

	init : function() {
		$('#about-modal').modal({
			show : false
		});
		$('#show-about-button').button().click(function() {
			$('#about-modal').modal('show');
		});

		$('#show-about-button').button().click(function() {
			ocupabrasil.loadSocialMentions(null, null, '/mentions/photos');
		});

		var baseUrl = '/mentions';
		ocupabrasil.loadSocialMentions(null, null, baseUrl);

	},

	loadSocialMentions : function(page, onEnd, actionUrl) {
		page = page || ocupabrasil.currentPage;
		var $boxContainer = $('#box-container');
		$.ajax({
			url : actionUrl,
			type : 'get',
			dataType : 'json',
			data : {
				page : page
			},
			success : function(data, textStatus, req) {
				ocupabrasil.trackPageView('/mentions/page/' + page);
				$.each(data.mentions, function(i, mention) {
					var el = $(ocupabrasil.boxTemplate($.extend(mention, ocupabrasil.boxViewHelper)));
					el.dataRef = mention;
					$boxContainer.append(el);
					el.find('.timeago').timeago().tooltip();
					el.find('a.content-source').tooltip();
				});
				$boxContainer.imagesLoaded(function() {
					$boxContainer.masonry('reload');
				});
			},
			complete : function(req, status) {
				if (onEnd) {
					onEnd.call(this, req, status);
				}
			}
		});
	},

	trackPageView : function(url) {
		if (_gaq) {
			_gaq.push(['_trackPageview', url]);
		}
	},

	formatter : {

		link : function(url, text, target) {
			text = text || url;
			if (target) {
				return '<a href="' + url + '" target="' + target + '">' + text + '</a>';
			} else {
				return text.link(url);
			}			
		},

		formatLink : function(text) {
			return text.replace(/[A-Za-z]+:\/\/[A-Za-z0-9-_]+\.[A-Za-z0-9-_:%&~\?\/.=]+/g, function(url) {
				return ocupabrasil.formatter.link(url, url, '_blank');
			});
		},

		formatUserMention : function(text, source) {
			var url = ocupabrasil.sourceUrls[source].userProfile;
			return text.replace(/[@]+[A-Za-z0-9-_]+/g, function(u) {
				var username = u.replace('@', '');
				return ocupabrasil.formatter.link(url + username, u, '_blank');
			});
		},

		formatHashtag : function(text, source) {
			var url = ocupabrasil.sourceUrls[source].tag;
			return text.replace(/[#]+[A-Za-z0-9-_]+/g, function(t) {
				var tag = t.replace('#', '');
				return ocupabrasil.formatter.link(url + tag, t, '_blank');
			});
		}

	}

};

$(ocupabrasil.init);