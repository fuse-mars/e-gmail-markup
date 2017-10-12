/**
 * We want to execute the content script after the page has fully loaded
 * Page must be showing gmail message detail
 */
(function(chrome, undefined) {
    'use strict';
    chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
        let { status } = changeInfo;
        let { active, url } = tab;
        
        if(active && status === 'complete') {
            if(isGmailMessagePage(url)) {
                chrome.tabs.sendMessage(tab.id, { type: "PAGE_URL_CHANGED" });
            }
        }
    })
})(chrome)

/**
 * return true for "https://mail.google.com/mail/u/0/#inbox/15f010055e34b3c4"
 * return false for "https://mail.google.com/mail/u/0/#inbox/"
 * return false for "https://mail.google.com/mail/u/0/#inbox"
 * Assume that the gmail message id contains "digit" and "lowercase letters"
 * @param {string} url 
 * @return boolean
 */
function isGmailMessagePage(url) {
    // return input.match(/#inbox\/([0-9]|[a-z])/) === null;
    // return input.match(/#inbox\/([0-9]|[a-z])/) === Array<number| string>
    let match = url.match(/#inbox\/([0-9]|[a-z])/)
    return isArray(match) && match.length > 0
}

function isArray(value) {
    return (typeof value === 'object') && (value !== null) && (typeof value.length === 'number');    
}