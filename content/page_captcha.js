var originUrl = "https://newassets.hcaptcha.com";
console.log('page catchap', window.location.origin);
console.log(document.querySelector('body'));
var funcUtils = {
    waitValit: () => new Promise((resolve, reject) => {
  
        let changeStorageCallback = time => {
            chrome.storage.sync.get(['validHumanExist'], result => {

                if('validHumanExist' in result && result.validHumanExist) {
                    chrome.storage.sync.set({ validHumanExist: false }, () => {
                        resolve(result.validHumanExist);
                    });
                    return;
                }

            });
    
            setTimeout(() => changeStorageCallback.call(this, time + 1), 250);
        }
        
        changeStorageCallback.call(this, 0);
    }),
    waitElement: waitTimer => new Promise((resolve, reject) => {
        var element = document.getElementById('checkbox');
        var timer = 0;

        var IntervalId = setTimeout(() => {
            console.log('eleme', element);
            if (typeof(element) != 'undefined' && element != null) {
                resolve(element);
                return;
            }

            reject('no se pudo resolver hay un error (page || module inyect)');
            clearTimeout(IntervalId);
        }, waitTimer);
    })
}

var start = function () {
    var time = 0;
    var eleCap = null;

    if(window.location.origin != originUrl) {
        console.log('no match url');
        return; 
    }
    
    let timeStart = cTime => {
        //is resolve ckeck ok
        if(document.querySelector('#anchor-state .pulse').style.display == 'none') {
            
            //si se habre resolve human
            //si al hacer click no hace nada
            //y si no refreh page freeBitcoin

            if(document.querySelector('#anchor-state .check').style.display != 'none'){
                console.log('resolve captcha');
                chrome.runtime.sendMessage({
                    event: 'clickRoll',
                    content: {
                        action: 'clickRoll',
                        pageContent: 'page_freecoint'
                    } 
                });        
                return;
            } 

            chrome.runtime.sendMessage({
                event: 'validHumanCaptcha',
                content: {
                    action: 'validHuman',
                    pageContent: 'page_freecoint'
                } 
            });

            console.log('ttttt');

            funcUtils.waitValit().then(res => {
                if(!res) resolveCathInit(time); // is not frame human resolve
                //reload page
                chrome.runtime.sendMessage({ event: 'reloadPage'});
            });

            return;
        }

        console.log('wait resolve');
        setTimeout(() => timeStart.call(this, cTime + 1), 500);
    }

    let resolveCathInit = time => {
        if(eleCap != null) {
            console.log('asdsaasd');
            eleCap.click();
            timeStart(time);
        }
    }

    funcUtils.waitElement(1000).then(element => {
        eleCap = element;
        console.log('waitele', eleCap);
        resolveCathInit(time);
    }).catch(error => {
        chrome.runtime.sendMessage({ event: 'reloadPage'});
        console.warn('captchat incapture button click', error);
    });

    console.log('iiiiiiiiiiiiiiiiiiiiiiii');
};

/*chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    
    if(request.page == "page_catcha") console.log('Messaje page catcha');
    console.log('datares', request);
});*/

//start
start();