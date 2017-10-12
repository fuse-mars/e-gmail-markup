/**
This script affects all Html elements that have data-egm-managed="true" attribute

Example html elements that are identified by this script

<button title="egm button" name="Ignore Person" class="google-button">Ignore Person</button>
<script type="application/ld+json" data-egm-managed="true">
    {
        "@context": "http://schema.org",
        "@type": "SaveAction",
        "name": "Ignore Person",
        "handler": {
            "@type": "HttpActionHandler",
            "url": "https://example.com/ignore/person?messageId=xyz789",
            "method": "HttpRequestMethod.GET"
        }
    }
</script>

We have a "button" and a "JSON-LD script" to take action on, when the button is clicked. 
1. Script is identified by the presence of "data-egm-managed" attribute
--- The script affects JSON-LD scripts with this attribute set to true (i.e. data-egm-managed="true")
2. Button is identified by the "name" attribute
--- The value of this attribute must match with the name of the action in the JSON-LD script,
--- so in our example we have name="Ignore Person", because there is a [ "name": "Ignore Person", ] entry in our JSON-LD script.
3. Because of Gmail's restrictions, we use the title to identify the button that is managed by EGM 
--- all EGM managed buttons must have a title attribute with value "egm button"
--- i.e. title="egm button"

 */

// START Extending jQuery
// source: https://stackoverflow.com/questions/16777003/what-is-the-easiest-way-to-disable-enable-buttons-and-links-jquery-bootstrap
jQuery.fn.extend({
    disable: function(state) {
        return this.each(function() {
            this.disabled = state;
        });
    }
});
// END Extending jQuery

// START
// @TODO refactor
var EGM = {
    BACKEND: {
        host: '<host>',
        endpoint: '/gmail/actions'
    }
};
// END 

(function(window, document, chrome, $, undefined){
    'use strict'

    const console = window.console;

    // let egmButton = $('button[data-egm-managed="true"]')
    // let egmScript = $('script[data-egm-managed="true"][type="application/ld+json"]')
    // console.info('START EGM Button');
    // console.info(egmButton);
    // console.info(egmScript);
    // console.info(window.GLOBALS);
    // console.info('END EGM Button');
    window.addEventListener("message", function(event) {
        // We only accept messages from ourselves
        if (event.source != window)
            return
        
        if (event.data.type && (event.data.type == "FROM_GMAIL_PAGE")) {

            let { host, ik, jsver, messageId } = event.data // from Gmail
            let url = `${host}?ui=2&ik=${ik}&jsver=${jsver}&view=om&th=${messageId}`
            // console.info(url)

            fetchOriginalMessage(url).then(data => {
                let gmailMessage = extractGmailHTMLMessage($, data)
                if(gmailMessage) {
                    let actions = extractEGMActions($, gmailMessage)

                    actions.forEach(({ jsonld, button }) => {
                        console.info(jsonld, button)
                        // @TODO add a listen on all buttons
                        let initText = button.html()                        
                        button.addClass('egm-google-button')
                        button.on('click', function(event) {
                            event.preventDefault();
                            console.log(event);
                            // show loading icon in the button
                            $(this).disable(true)
                            $(this).html(`
                                ${initText}
                                &nbsp; <img src="https://ssl.gstatic.com/ui/v1/icons/mail/sma/loading2.gif">
                            `)
                            // @TODO send JSON-LD based request to backend                     
                            console.log('START');
                            makeJSONLDRequest(jsonld)
                            .then(res => {
                                $(this).html(initText)
                                $(this).addClass('succedded')
                            })
                            .catch(e => {
                                console.log('END');                            
                                $(this).addClass('failed')
                                $(this).html(`
                                    ${initText}
                                    &nbsp; <img src="https://ssl.gstatic.com/ui/v1/icons/mail/sma/problem2.png">
                                `)
                                $(this).disable(false)
                                // setTimeout(() => {
                                //     $(this).removeClass('failed')
                                //     $(this).html(initText)
                                //     $(this).disable(false)
                                // }, 2500)                         
                            })
                        })
                    })    

                }  
            })
            .catch(e => {
                console.info(e)
            })
        }

    }, false);



    chrome.extension.onMessage.addListener(function(msg, sender, sendResponse) {
        if (msg.type === 'PAGE_URL_CHANGED') {
            injectScript(chrome.extension.getURL('/egm-inject.js'), 'body', document);
        }
    });

})(window, document, chrome, jQuery);

// .raw_message
/**
 * 
 * @param {JSON} jsonld
 * @return {Promise<any>}
 */
function makeJSONLDRequest(jsonld) {
    // @TODO make a call to the backend (EGM.BACKEND.host)
    return new Promise((resolve, reject) => {
        setTimeout(() => reject({ ok: false }), 1000)
    })
}


/**
 * 1. extract the json-ld
 * 2. find the corresponding button in the displayed message
 * @param {jQuery} $ 
 * @param {string} message the gmailMessage 
 * @return Array<{ jsonld: JSON, button: jQuery }>
 */
function extractEGMActions($, message) {
    // console.info(gmailMessage)               
    // let gmailHtml = createGmailHtml($, gmailMessage)
    let script = extractJSONLDScript(message)
    // let action = extractJSONLDjson($, script)
    let jsonld = extractJSONLDjson($, script)
    let button = findEGMButton($, jsonld['name']) // get this from gmail page DOM
    return [{ jsonld, button }].filter(a => a.jsonld); 
}

function findEGMButton($, name) {
    return $(`button[title="egm button"][name="${name}"]`)
}
/**
 * 
 * @param {string} script
 * @return {JSON} 
 */
function extractJSONLDjson($, script) {
    let inner = $(script).text();
    return JSON.parse(inner);
}

/**
 * 
 * @param {string} gmailMessage 
 * @param {string} action
 * @return {jQuery} Script DOM element
 */
function extractJSONLDScript(gmailMessage) {
    let scripts = gmailMessage.match(/<script([\s\S]*)script>/g);
    return scripts.find(s => s.includes('data-egm-managed="true"') && s.includes('type="application/ld+json"'))
}
/**
 * 
 * @param {jQuery} $ 
 * @param {string} text 
 * @return {jQuery}
 */
function createGmailHtml($, text) {
    return textTohtml($, text);
}

/**
 * 
 * @param {jQuery} $ 
 * @param {string} input
 * @return {string} or undefined if message does not contain html
 */
function extractGmailHTMLMessage($, input) {
    let messageWrapper = textTohtml($, input);
    let gmailMessage = $(messageWrapper.find('.raw_message')).text();
    gmailMessage = gmailMessage.split('Content-Type: text/html; charset="UTF-8"')[1];
    if(!gmailMessage) return undefined;
    gmailMessage =  gmailMessage.match(/<html([\s\S]*)html>/);
    if(!gmailMessage) return undefined;
    gmailMessage =  gmailMessage[0];
    return  gmailMessage;   
}

/**
 * 
 * @param {jQuery} $ 
 * @param {string} input 
 * @return {jQuery}
 */
function textTohtml($, input) {
    return $(input)
}

/**
 * 
 * @param {string} url url to the original Message sent to Gmail server
 * example: https://mail.google.com/mail/u/1/?ui=2&ik=158bdc3ef0&jsver=khUFNOKniXg.en.&view=om&th=15f0b03c8b7fd7d6
 */
function fetchOriginalMessage(url) {
    return new Promise((resolve, reject) => {
    return $.get(url)
    .done(function(data) {
        // console.info( data );
        return resolve(data);
      })
      .fail(function(e) {
        // console.info(e);
        return reject(e);
      })
    })    
}

/**
 * source: https://gist.github.com/nok/a98c7c5ce0d0803b42da50c4b901ef84
 * @param {*} file 
 * @param {*} node 
 */
function injectScript(file, node, document) {
    var th = document.getElementsByTagName(node)[0];
    var s = document.createElement('script');
    s.setAttribute('type', 'text/javascript');
    s.setAttribute('src', file);
    th.appendChild(s);
}