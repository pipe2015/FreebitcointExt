console.log('page freecoint', window.location.origin);


console.log(document.querySelector('body'));


/*var port = chrome.runtime.connect({name: "script_freecoint"});

port.onMessage.addListener(function(msg) {
    
    console.log('Mensaje page freecoint', msg);
});*/

function validHumanCaptcha() {
    var iframe = document.querySelectorAll('iframe');
    var node = iframe[iframe.length - 1].parentElement.parentElement;

    if(node.style.opacity != "1" && node.style.visibility != 'visible') return false;
    return true;
}

function clickRoll(callback) {
    var button = document.getElementById('free_play_form_button');

    if(button.style.display != 'none') {
        button.click();
        return callback(true);
    }

    callback(false);
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

    if(request.action == "validHuman" && request.page == "page_freecoint") {
        sendResponse(validHumanCaptcha());
    }

    if(request.action == "clickRoll" && request.page == "page_freecoint") {
        clickRoll(isClick => sendResponse(isClick));
    }
    
});
