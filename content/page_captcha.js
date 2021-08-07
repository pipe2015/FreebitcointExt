var originUrl = "https://newassets.hcaptcha.com";
console.log('page catchap', window.location.origin);
console.log(document.querySelector('body'));
var funcUtils = {
    waitValit: () => new Promise((resolve, reject) => {
        var countMax = 10;
        let changeStorageCallback = time => {
            chrome.storage.sync.get(['validHumanExist'], result => {

                if('validHumanExist' in result && result.validHumanExist) {
                    chrome.storage.sync.set({ validHumanExist: false }, () => {
                        resolve(result.validHumanExist);
                    });
                    return;
                }

                if(time >= countMax) return reject();

                setTimeout(() => changeStorageCallback.call(null, time + 1), 500);
            });
        }
        
        changeStorageCallback(0);
    }),
    waitElement: waitTimer => new Promise((resolve, reject) => {
        var countMax = 5;
        var timeWait = 1000;

        var timeStart = count => {
            var element = document.getElementById('checkbox');
            if (typeof(element) != 'undefined' && element != null) {
                console.log('eleme', element);
                return resolve(element);
            }

            if(count >= countMax) {
                return reject('no se pudo resolver hay un error (page || module inyect)');
            }
            
            setTimeout(() => timeStart.call(null, count + 1), timeWait);
        }

        setTimeout(timeStart, waitTimer, 0);
    })
}

var start = function () {
    var time = 0;
    var eleCap = null;

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
            
            //lo remplace para no tener tantos problemas (mejor solucion):

            window.parent.postMessage({
                action: 'validHuman',
                pageContent: 'page_freecoint'
            }, 'https://freebitco.in');

            console.log('ttttt');

            return;
            /*chrome.runtime.sendMessage({
                event: 'validHumanCaptcha',
                content: {
                    action: 'validHuman',
                    pageContent: 'page_freecoint'
                } 
            });*/

            

            /*funcUtils.waitValit().then(res => {
                if(!res) resolveCathInit(time); // is not frame human resolve
                //reload page
                window.location.reload();
            }).catch(() => window.location.reload());*/
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
    
    funcUtils.waitElement(5000 + (Math.floor(Math.random() * 5) * 1000)).then(element => {
        eleCap = element;
        console.log('waitele', eleCap);
        resolveCathInit(time);
    }).catch(error => {
        chrome.runtime.sendMessage({ event: 'reloadPage'});
        console.warn('captchat incapture button click', error);
    });
};

/*chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    
    if(request.page == "page_catcha") console.log('Messaje page catcha');
    console.log('datares', request);
});*/

//start
start();