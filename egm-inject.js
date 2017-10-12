/**
 * We want to send some values from the page's script to the content script
 */
(function(window, undefined) {
	'use strict';
	function sendMessageDetail(evt) {
		var host = window.GLOBALS[31];
		var ik = window.GLOBALS[9];
		var jsver = window.GLOBALS[4];
		var messageId = location.hash.replace('#inbox/', '');
		window.postMessage(
			{
				type: 'FROM_GMAIL_PAGE',
				host: host,
				ik: ik,
				jsver: jsver,
				messageId: messageId,
			},
			'https://mail.google.com'
		);
	}
	sendMessageDetail();
})(window);
