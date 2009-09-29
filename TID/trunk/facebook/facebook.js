var _api = null;
var _uid = null;
var _appPermissionPage = null;
var _userInfoRequest = null;
var _notificationsRequest = null;
var _streamRequest = null;
var _timer = null;
var _stats = {
    requests: 0,
    success: 0,
    fail: 0
};

var _attachment = null;

var _status_init_ready = true;

_userName = '';
_userUrl = '';
_userPicUrl = '';
_userPicSquareLogo = '';

function setStatus() {
	var postTime = (new Date()).getTime() / 1000;
	var status = $('#statusinput').val();
	var statusMod = replaceUrls($('#statusinput').val());
	
	var linkedStatus;
	
	if (_status_init_ready) {
		alert('Please, enter a status message');
		return;
	}
	
	if ($('#imageinput').val() != '') {
		_attachment = {'media': [{'type': 'image', 'src': $('#imageinput').val(), 'href':$('#imageinput').val()}]};
	} else if ($('#videoinput').val() != '') {
		_attachment = {'media': [{'type': 'video', 'video_src': $('#videoinput').val(),
			'preview_img': getVideoThumbnail($('#videoinput').val())}]};
	} else if ($('#linkinput').val() != '') {
		_attachment = {'href': $('#linkinput').val()};
	}
	
	if (_attachment == null) {
		linkedStatus = "";
	} else if ($('#imageinput').val() != '') {
		linkedStatus = 
			'<div class="photoupdate">' +
			'<a href="' + _attachment.media[0].href + '" target="_blank">' +
			'<img src="' + _attachment.media[0].src + '" border="0" />' +
			'</a></div><div class="c"></div>';
	} else if ($('#videoinput').val() != '') {
		linkedStatus = 
			'<div class="photoupdate">' +
			'<a href="' + _attachment.media[0].video_src + '" target="_blank">' +
			'<img src="' + _attachment.media[0].preview_img + '" border="0" />' +
			'</a></div><div class="c"></div>';
	} else if ($('#linkinput').val() != '') {
		linkedStatus = 
			'<div class="photoupdate">' +
			'<a href="' + _attachment.href + '" target="_blank">' +
			$('#statusinput').val() +
			'</a></div><div class="c"></div>';
	}
	
	var listItem = document.createElement('li');
	$(listItem).addClass('transitem');
	listItem.innerHTML = 
		createFeedRow(
			'newitem',_userName, _userUrl, _userPicUrl, statusMod, linkedStatus,
			'posting...', null, null);
	$('#feedlist').prepend(listItem);
	$('#statusinput').val("What's on your mind?");
	$('#statusinput').css('color', 'gray');
	_status_init_ready = true;
	$('#imageinput').val('');
	$('#imagebox').hide();
	$('#videoinput').val('');
	$('#videobox').hide();
	$('#linkinput').val('');
	$('#linkbox').hide();
	// Post the status, image or video to the users's stream
	FB.Connect.streamPublish(status, _attachment, null, null, '',
		function() {
			onStatusSet(listItem, postTime, statusMod, linkedStatus);
		},
		true
	);

};


function onStatusSet (listItem, postTime, status, attachmentHtml) {
	_attachment = null;
	$(listItem).removeClass('transitem');
	var duration = ((new Date()).getTime() / 1000) - postTime;
	listItem.innerHTML = 
		createFeedRow(
			'newitem', _userName, _userUrl, _userPicUrl, status, attachmentHtml,
			formatDuration(duration), null, null);
};
  
function showConnectButton () {
    $('#login').hide();
	$('#content').hide();
	$('#notificationsbar').hide();
	$('#login-bt').show();
};


function init(){
	
	$('#statusbutton').click(
		function() {
			setStatus();
		}
	);

	/*$('#statusinput').keyup(
		function(e) {
			if (e.keyCode == 13) {
				setStatus();
			}
		}
	);*/
	
	$('#statusinput').click(
		function() {
			if (_status_init_ready) {
				$('#statusinput').val('');
				$('#statusinput').css('color', 'black');
				_status_init_ready = false;
			}
		}
	);
	
	$('#statusinput').val("What's on your mind?");
	$('#login-bt').hide();
	FB.Facebook.get_sessionWaitable().waitUntilReady(
		function(){
			onSessionReady();
		}
	);
}

function onSessionReady(){
	_api = FB.Facebook.apiClient;
	_uid = _api.get_session().uid;
	// Close existing perms window if needed.
	if (_appPermissionPage) {
		_appPermissionPage.close();
		_appPermissionPage = null;
	}
	// Check permissions.
	_api.users_hasAppPermission('read_stream',
		function(result) {
			onAppPermissionResult(result);
		}
	);

}

function onAppPermissionResult(result){
	if (result == 0) {
		if (window.location.search.length > 0 &&
			window.location.search.indexOf('appPermissionPage') != -1) {
			// If the window is closed manually, recheck permission
			window.onunload = function() {
				window.opener.onSessionReady();
			};
			$('#login').hide();
			FB.Connect.showPermissionDialog ('read_stream,offline_access,status_update',
				function(perms) {
					onPermsAction(perms);
				}
			);
			$('.fb_popup').css('top', '0');
		} else {
			var appPermissionMsg = 'This gadget is not Autorized to access your profile on Facebook<br /><br />';
			appPermissionMsg += '<b>'
			appPermissionMsg += '<a href="javascript:;" onclick="showAppPermissionPage()">';
			appPermissionMsg += 'Click here to authorize the gadget';
			appPermissionMsg += '</a></b>';
			$('#login').html(appPermissionMsg);
			$('#login').show();
		}
		return;
	}
	$('#login').html('Getting your Facebook feed...');
	$('#login').show();
	getFacebookFeed();
}

function refresh(){
	$('#login').html('Getting your Facebook feed...');
	$('#login').show();
	getFacebookFeed();
}

function onPermsAction(perms) {
  window.opener.onSessionReady();
};

function showAppPermissionPage () {
  _appPermissionPage = window.open('http://ezweb.tid.es/repository/ezweb-gadgets/facebook/facebook_0.9.2/facebook_authorization.html?appPermissionPage', 'ezwebFacebookPermissionPage',
      'width=505,height=450,' +
      'scrollbars=yes,titlebar=no,menubar=no,location=no,status=no');
};

function getFacebookFeed() {
	// Build a batch request.
	var sequencer = new FB.BatchSequencer();
	
	_userInfoRequest = _api.users_getInfo([_uid], [
		'name',
		'profile_url',
		'status',
		'pic_square_with_logo',
		'pic_square'], sequencer);
	_notificationsRequest = _api.notifications_get(sequencer);
	
	var nowSec = (new Date()).getTime() / 1000;
	_streamRequest = _api.stream_get(null, 
		(nowSec - ONE_WEEK_SEC), nowSec, 25, 'nf', sequencer);
		
	sequencer.execute(
		function() {
			handleDataFetch()
		}
	);
	_stats.requests++;
};

function checkResponseIsValid (request) {
	return request.get_isReady() && request.result;
};

function handleDataFetch () {
	if (!checkResponseIsValid(_userInfoRequest) ||
		!checkResponseIsValid(_notificationsRequest) ||
		!checkResponseIsValid(_streamRequest)) {
		if (_stats.success > 0) {
			$('#content').html('Data from Facebook was invalid. Trying again in a minute... (Error ' + (_stats.success > 0) + ')');
		}
		_stats.fail++;
		
	} else {
		processUserInfo();
		processNotifications();
		processStream();
		_stats.success++;
	}
	
	$('#login').hide();
	$('#content').show();
	
	if (_timer) {
		clearInterval(_timer);
		_timer = null;
	}
	_timer = setInterval(
		function() {
			getFacebookFeed();
		}, 300000);
};

function processUserInfo() {
	var user = _userInfoRequest.result[0];
	_userName = user.name;
	_userPicUrl = user.pic_square;
	_userPicSquareLogo = user.pic_square_with_logo;
	_userUrl = user.profile_url;
	renderUserInfo(_userName, _userPicSquareLogo, _userUrl);
};

function renderUserInfo(name, picUrl, profileUrl) {
	var nameHtml = '<b><a href="' + profileUrl + '" target="_blank">' +
		name + "</a></b>";
	$('#name').html('Welcome, ' + nameHtml);
	
	var picHtml = '<a href="' + profileUrl + '" target="_blank">' +
		getImageTagFor(picUrl) + "</a>";
		
	$('#profilepic').html(picHtml);
};

function processNotifications() {
	var nots = _notificationsRequest.result;
	
	var notHtml = '';
	if (nots.friend_requests && nots.friend_requests.length > 0) {
		notHtml += getNotificationLink(nots.friend_requests.length,
		IMAGES.FRIEND_REQ, 'http://www.facebook.com/reqs.php#friend');
	}
	if (nots.messages && nots.messages.unread > 0) {
		notHtml += getNotificationLink(nots.messages.unread,
		IMAGES.MAIL, 'http://www.facebook.com/inbox');
	}
	if (nots.event_invites && nots.event_invites.length > 0) {
		notHtml += getNotificationLink(nots.event_invites.length,
		IMAGES.EVENT, 'http://www.facebook.com/reqs.php#event');
	}
	if (nots.pokes && nots.pokes.unread > 0) {
		notHtml += getNotificationLink(nots.pokes.unread,
		IMAGES.POKE, 'http://www.facebook.com');
	}
	if (nots.group_invites && nots.group_invites.length > 0) {
		notHtml += getNotificationLink(nots.group_invites.length,
		IMAGES.GROUP, 'http://www.facebook.com/groups.php');
	}
	if (nots.shares && nots.shares.unread > 0) {
		notHtml += getNotificationLink(nots.shares.unread,
		IMAGES.SHARE, 'http://www.facebook.com');
	}

	if (/MSIE 6/i.test(navigator.userAgent)) {
		$('#notifications_legacy').html(notHtml);
	} else {
		if (notHtml != '') {
			$('#notifications').html(notHtml);
			$('#notificationsbar').show();
		} else {
			$('#notificationsbar').hide();
		}
	}
};

function processStream() {
	var streamHtml = '';
	var streamList = _streamRequest.result.posts;
	var profileList = _streamRequest.result.profiles;

	var profileMap = {};
	for (var i = 0; i < profileList.length; i++) {
		var profile = profileList[i];
		profileMap['p' + profile.id] = {
			name: profile.name,
			pic: profile.pic_square,
			url: profile.url
		};
	}

	var feedList = $('#feedlist');
	feedList.empty();
	for (var i = 0; i < streamList.length; i++) {
		var streamItem = streamList[i];

		var photo = null;
		if (streamItem.attachment.media) {
			for (var m = 0; m < streamItem.attachment.media.length; m++) {
				var media = streamItem.attachment.media[m];
				if (media.type == 'photo' || media.type == 'link') {
					photo = {
						src: media.src,
						href: media.href,
						name: streamItem.attachment.name,
						description: streamItem.attachment.description,
						caption: streamItem.attachment.caption
					};
					break;
				} else if (media.type == 'video') {
					photo = {
						src: media.src,
						href: media.href,
						name: streamItem.attachment.name,
						description: streamItem.attachment.description,
						caption: streamItem.attachment.caption
					};
					break;
				}
			}
		}

		var nowSec = (new Date()).getTime() / 1000;
		var timeDeltaToPost = nowSec - streamItem.created_time;
		var humanReadableDuration = formatDuration(timeDeltaToPost);
		var profile = profileMap['p' + streamItem.actor_id];
		var listItem = document.createElement('li');

		if (photo) {
			var messageHtml =
			'<div class="photoupdate">' +
			'<a href="' + photo.href + '" target="_blank">' +
			'<img src="' + photo.src + '" border="0" />' +
			'</a></div><div class="c">';
			if (photo.name) {
				messageHtml += '<div class="c_name">' + photo.name + '</div>';
			}
			if (photo.description) {
				messageHtml += '<div class="c_description">' + photo.description + '</div>';
			}
			if (photo.caption) {
				messageHtml += '<div class="c_caption">' + photo.caption + '</div>';
			}
			messageHtml += '</div>';
			listItem.innerHTML = createFeedRow(streamItem.post_id,
			profile.name, profile.url, profile.pic, replaceUrls(streamItem.message),
			messageHtml, humanReadableDuration, streamItem.comments, profileMap);
		} else if (!streamItem.attachment || !streamItem.attachment.media || !streamItem.attachment.media.length) {
			// We have an empty media Object -> We have a simple status message
			listItem.innerHTML = createFeedRow(streamItem.post_id,
			profile.name, profile.url, profile.pic,
			replaceUrls(streamItem.message), "",
			humanReadableDuration, streamItem.comments, profileMap);
		}

		feedList.append(listItem);
	}
};

function getImageTagFor(url, opt_size) {
	return '<img src="' + url + '" border="0" />';
};

function getNotificationLink (count, image, url) {
	return '<span class="notification-item">' +
		'<a href="' + url + '" target="_blank">' +
		count + getImageTagFor(image) + '</a></span>';
};

function replaceUrls (str) {
	return str.replace(/(https?:\/\/\S+)/g, '<a href="$1" target="_blank">$1</a>');
};


function logout() {
	//FB.Connect.logoutAndRedirect('/repository/facebook/facebook_2.html');
	FB.Connect.logout(function() {
		showConnectButton();
	});
};

function createFeedRow(id, name, profileUrl, picUrl, message, attachmentHtml, duration, comments, profileMap) {
	var rowHtml = '<div>';
	rowHtml += '<table>';
	rowHtml += '<tbody>';
	rowHtml += '<tr>';
	rowHtml += '<td class="itempic">' +
	'<a href="' + profileUrl + '" target="_blank">';
	rowHtml += getImageTagFor(picUrl);
	rowHtml += '</a></td>';
	rowHtml += '<td class="item">';
	rowHtml += '<div class="itemcontent">' +
	'<div class="itemUser"><a href="' + profileUrl + '" target="_blank">' +
	name + '</a></div><div class="itemTitle">' + message + "</div></div>";
	rowHtml += attachmentHtml;
	rowHtml += '<div class="itemstamp">' + duration + ' | ';
	if (comments && comments.count > 0) {
		if (!comments.comment_list) {
			rowHtml += '<a href="http://www.facebook.com" target="_blank">' +
				comments.count + ' comment' + ((comments.count > 1) ? 's' : '');
		} else {
			rowHtml += '<a href="javascript:;" onclick="toggleComments(\'' + id + '\')">';
			rowHtml += '<span id="comments-show-' + id + '">';
			rowHtml += comments.count;
			rowHtml += ' comment' + ((comments.count > 1) ? 's' : '');
			rowHtml += '</span>';
			rowHtml += '<span id="comments-hide-' + id + '" style="display:none">';
			rowHtml += 'hide comment' + ((comments.count > 1) ? 's' : '');
			rowHtml += '</span>';
		}
	} else {
		rowHtml += '<a href="http://www.facebook.com" target="_blank">' +
		'no comments';
	}
	rowHtml += '</a>';
	rowHtml += '</div>';
	rowHtml += '</td>';
	rowHtml += '</tr>';
	rowHtml += '<tr><td></td>';
	rowHtml += '<td>';
	if (comments && comments.count > 0 && comments.comment_list) {
		rowHtml += '<div id="comments' + id + '" class="commentlist" style="display:none">';
		for (var i = 0; i < comments.comment_list.length; i++) {
			var comment = comments.comment_list[i];
			var poster = profileMap['p' + comment.fromid];
			rowHtml += '<table><tbody><tr>' +
			'<td class="commentpic">' +
			'<a href="' + profileUrl + '" target="_blank">' +
			getImageTagFor(poster.pic) +
			'</a></td>' +
			'<td>' +
			'<b><a href="' + poster.url + '" target="_blank">' + poster.name +
			'</a></b>&nbsp;' + comment.text +
			'</td>' +
			'</tr></tbody></table>';
		}
		rowHtml += '<div class="postcommentprompt">';
		rowHtml += '<a href="http://www.facebook.com" target="_blank">Post a comment</a>';
		rowHtml += '</div></div>';
	}
	rowHtml += '</td>';
	rowHtml += '</tr>';
	rowHtml += '</tbody>';
	rowHtml += '</table>';
	rowHtml += '</div>';
	rowHtml += '<div class="feedseparator"></div>';
	return rowHtml;
};

function toggleComments(id) {
	  $('#comments' + id).toggle();
	  $('#comments-show-' + id).toggle();
	  $('#comments-hide-' + id).toggle();
};

function formatDuration (seconds) {
	var n = Math.round(seconds);
	var unit = 'second';
	for (var i = 0; i < TIME_VALUES.length; i++) {
		var d = Math.round(seconds / TIME_VALUES[i].duration);
		if (d > 0) {
			n = d;
			unit = TIME_VALUES[i].name;
			break;
		}
	}
	if (n > 1) {
		unit += 's';
	}
	return n + ' ' + unit + ' ago';
};

function showImageForm() {
	$('#imagebox').show();
	$('#videobox').hide();
	$('#linkbox').hide();
}

function closeImageForm() {
	$('#imagebox').hide();
}

function showVideoForm() {
	$('#videobox').show();
	$('#imagebox').hide();
	$('#linkbox').hide();
}

function closeVideoForm() {
	$('#videobox').hide();
}

function showLinkForm() {
	$('#linkbox').show();
	$('#videobox').hide();
	$('#imagebox').hide();
}

function closeLinkForm() {
	$('#linkbox').hide();
}

function getVideoThumbnail(url) {
	if (url.indexOf(YOUTUBE_VIDEO) == 0) {
		var youTubeVideoId;
		if (url.indexOf('?') > 0) {
			youTubeVideoId = url.substring(YOUTUBE_VIDEO.length,url.indexOf('?'));
		} else if (url.indexOf('&') > 0) {
			youTubeVideoId = url.substring(YOUTUBE_VIDEO.length,url.indexOf('&'));
		} else {
			youTubeVideoId = url.substring(YOUTUBE_VIDEO.length,YOUTUBE_VIDEO.length+11);
		} 
		return 'http://img.youtube.com/vi/' + youTubeVideoId + '/default.jpg';
	} else {
		return 'http://ezweb.tid.es/repository/ezweb-gadgets/facebook/facebook_0.9.2/static/images/video_play_icon_L.gif';
	}
}


ONE_WEEK_SEC = 7 * 24 * 60 * 60;

IMAGES = {
  MAIL: 'http://ezweb.tid.es/repository/ezweb-gadgets/facebook/facebook_0.9.2/static/images/mail.gif',
  EVENT: 'http://ezweb.tid.es/repository/ezweb-gadgets/facebook/facebook_0.9.2/static/images/event.gif',
  FRIEND_REQ: 'http://ezweb.tid.es/repository/ezweb-gadgets/facebook/facebook_0.9.2/static/images/friendreq.gif',
  GROUP: 'http://ezweb.tid.es/repository/ezweb-gadgets/facebook/facebook_0.9.2/static/images/group.gif',
  POKE: 'http://ezweb.tid.es/repository/ezweb-gadgets/facebook/facebook_0.9.2/static/images/poke.gif',
  SHARE: 'http://ezweb.tid.es/repository/ezweb-gadgets/facebook/facebook_0.9.2/static/images/share.gif',
  VIDEO: 'http://ezweb.tid.es/repository/ezweb-gadgets/facebook/facebook_0.9.2/static/images/video.gif',
  PHOTO: 'http://ezweb.tid.es/repository/ezweb-gadgets/facebook/facebook_0.9.2/static/images/photo.gif',
  LINK: 'http://ezweb.tid.es/repository/ezweb-gadgets/facebook/facebook_0.9.2/static/images/link.gif'
};

YOUTUBE_VIDEO = "http://www.youtube.com/v/";

TIME_VALUES = [
  { name: 'year', duration: 31556926 },
  { name: 'month', duration: 2629743 },
  { name: 'week', duration: 604800 },
  { name: 'day', duration: 86400 },
  { name: 'hour', duration: 3600 },
  { name: 'minute', duration: 60 }
];