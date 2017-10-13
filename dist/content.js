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
        host: 'https://06be5d8f.ngrok.io',
        endPoint: '/gmail/actions'
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

                    // @TODO show EGM button "EGM Processing"
                    // showEGMStatusButton($, 'EGM Processing ...')
                    let actions = extractEGMActions($, gmailMessage)
                    if(actions.length > 0) {
                        // @TODO show EGM button "EGM Managed"
                        showEGMStatusButton($, 'EGM Managed')                       
                    }

                    actions.forEach(({ jsonld, button }) => {
                        console.info(jsonld, button)
                        attachButtonEventListener($, button, jsonld)
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

/**
 * Add a listener that will be triggered once the user clicks on the provided "button"
 * @param {jQuery} $ 
 * @param {jQuery<button>} button 
 * @param {jSON} jsonld 
 */
function attachButtonEventListener($, button, jsonld) {
    // @TODO add a listen on all buttons
    let initText = button.html()                        
    button.addClass('egm-google-button')
    button.off('click').on('click', function(event) {
        event.preventDefault();
        showButtonLoadingUI($, this, initText)
        // @TODO send JSON-LD based request to backend                     
        makeJSONLDRequest($, jsonld)
        .then(res => showButtonSuccessUI($, this, initText, res))
        .catch(e => showButtonErrorUI($, this, initText, e))
    
    })
}
/**
 * 
 * @param {jQuery} $ 
 * @param {jQuery<button>} button 
 * @param {string} initText 
 */
function showButtonLoadingUI($, button, initText) {
    // START show loading UI        
    // show loading icon in the button
    $(button).disable(true)
    $(button).html(`
        ${initText}
        &nbsp; <img src="https://ssl.gstatic.com/ui/v1/icons/mail/sma/loading2.gif">
    `)
    // END show loading UI
}
/**
 * 
 * @param {jQuery} $ 
 * @param {jQuery<button>} this 
 * @param {string} initText
 * @param {any} res
 */
function showButtonSuccessUI($, button, initText, res) {
    // START show success UI
    console.log(res)
    $(button).html(`
        ${initText}
        <img class="" src="https://mail.google.com/mail/u/0/images/cleardot.gif" alt="">
    `)
    $(button).removeClass('failed')
    $(button).addClass('succedded')
    // END show success UI
}
/**
 * 
 * @param {jQuery} $ 
 * @param {jQuery<button>} this 
 * @param {string} initText
 * @param {any} e
 */
function showButtonErrorUI($, button, initText, e) {
    // START show error UI
    console.log(e)                          
    $(button).addClass('failed')
    $(button).html(`
        ${initText}
        &nbsp; <img src="https://ssl.gstatic.com/ui/v1/icons/mail/sma/problem2.png">
    `)
    $(button).disable(false)  
    // END show error UI
}

/**
 * 
 * @param {jQuery} $ 
 * @param {string} text 
 */
function showEGMStatusButton($, text) {
    $('<td class="gH"><button class="egm-google-button google-T-I egm-status">EGM Managed</button></td>')
    .insertBefore('table .gH.acX')
}

// .raw_message
/**
 * 
 * @param {jQuery} $
 * @param {JSON} jsonld
 * @return {Promise<any>}
 */
function makeJSONLDRequest($, jsonld) {
    // @TODO make a call to the backend (EGM.BACKEND.host)
    return new Promise((resolve, reject) => {
        // setTimeout(() => reject({ ok: false }), 1000)
        return $.post(`${EGM.BACKEND.host}${EGM.BACKEND.endPoint}`, jsonld)
        .done(resolve)
        .fail(reject)
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
    let scripts = extractJSONLDScripts(message)
    // let action = extractJSONLDjson($, script)
    return scripts.map(script => {
        let jsonld = extractJSONLDjson($, script)
        let button = findEGMButton($, jsonld['name']) // get this from gmail page DOM
        return { jsonld, button }; 
    }).filter(a => a.jsonld)
}

/**
 * find a button or anchor that is managed by egm
 * @TODO refactor
 * @param {jQuery} $ 
 * @param {string} name 
 */
function findEGMButton($, name) {
    let buttonList = $(`button[title="egm button"]`)
    let button = buttonList.filter((i, el) => $(el).attr('name') && $(el).attr('name').includes(name))[0]
    let aList = $(`a[title="egm button"]`)
    let a = aList.filter((i, el) => $(el).attr('name') && $(el).attr('name').includes(name))[0]
    
    if(button) {
        let googleName = $(button).attr('name')
        button = $(`button[title="egm button"][name="${googleName}"]`)
    }
    if(a) {
        let googleName = $(a).attr('name')
        a  = $(`a[title="egm button"][name="${googleName}"]`)        
    }

    console.log('START findEGMButton')
    console.log(button)
    console.log(a)
    console.log('END findEGMButton')
    return button || a;
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
function extractJSONLDScripts(gmailMessage) {
    
    // scriptHolder =  "<script ..[ anything including other scripts (<script ... script>) in between ].. script>""
    let scriptHolder = gmailMessage.match(/<script([\s\S]*)<\/script>/g);
    
    // START make sure we have a script
    if(!scriptHolder) { return [] }
    scriptHolder = scriptHolder[0]
    if(!scriptHolder) { return [] }
    // END make sure we have a script
    
    // scripts = Array[ "....[includes only one <script ].... script>" ]
    // filter removes entries with empty string
    let scripts = scriptHolder.split(/<\/script>/g).filter(s => s).map(s => s+'</script>')
    
    // scripts = Array[ "<script....[ includes only content of one script ].... script>" ]
    scripts = scripts.map(script => script.match(/<script([\s\S]*)<\/script>/g)[0])

    console.log('START');
    console.log(scripts);
    console.log('END');
    return scripts.filter(s => s.includes('data-egm-managed="true"') && s.includes('type="application/ld+json"'))
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