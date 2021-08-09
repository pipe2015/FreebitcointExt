var originUrl = "https://newassets.hcaptcha.com";
console.log('page catchap', window.location.origin);

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
                return resolve(element);
            }

            if(count >= countMax) {
                return reject('no se pudo Obtener catpcha checkbox');
            }
            
            setTimeout(() => timeStart.call(null, count + 1), timeWait);
        }

        setTimeout(timeStart, waitTimer, 0);
    }),
    waitTime: (time, callback) => new Promise(resolve => setTimeout(() => {
        if(typeof callback != 'undefined') {
            callback();
            resolve();
            return;
        }
        resolve();
    }, time))
}

var init = function () {
    var sttime = 0;
    var eleCap = null;
    var loadpulse = 6;

    let timeStart = async cTime => {
        //is resolve ckeck ok
        if(document.querySelector('#anchor-state .pulse').style.display == 'none') {
            //espero un monento hasta que llegue la solicitud
            await funcUtils.waitTime(1000);
            
            //si se habre resolve human
            //si al hacer click no hace nada
            //y si no refreh page freeBitcoin

            if(document.querySelector('#anchor-state .check').style.display != 'none') {
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
            return window.parent.postMessage({
                action: 'validHuman',
                pageContent: 'page_freecoint'
            }, 'https://freebitco.in');

        }
        
        if(cTime >= loadpulse) {
            return window.parent.postMessage({
                action: 'withoutCaptcha',
                pageContent: 'page_freecoint'
            }, 'https://freebitco.in');
        }

        console.log('wait resolve');
        await funcUtils.waitTime(500, () => timeStart.call(this, cTime + 1));
        //setTimeout(() => timeStart.call(this, cTime + 1), 500);
    }
    
    let resolveCathInit = sttime => {
        if(eleCap != null) {
            console.log('asdsaasd');
            eleCap.click();
            timeStart(sttime);
        }
    }
    
    funcUtils.waitElement(5000 + (Math.floor(Math.random() * 5) * 1000)).then(element => {
        eleCap = element;
        console.log('waitele', eleCap);
        resolveCathInit(sttime);
    }).catch(error => {
        chrome.runtime.sendMessage({ event: 'reloadPage'});
        console.warn('captchat incapture button click', error);
    });
};

//start
init();