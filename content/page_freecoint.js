console.log('page freecoint', window.location.origin);

var utilsPromise = {
    frame: () => new Promise((resolve, reject) => {
        var countMax = 10;
        var timeStart = count => {
            var iframeUrl = document.querySelector('iframe');
            if(iframeUrl && iframeUrl != null) return resolve(iframeUrl.attributes.src.value);

            if(count >= countMax) return reject({
                message: 'no capture iframe element',
                reload: true 
            });
             
            setTimeout(() => timeStart.call(null, count + 1), 1000);
        }
        
        timeStart(0);
    }),
    timeWait: (time = 0) => new Promise((resolve, reject) => {
        var countMax = 10;
        var timeStart = count => {
            var node = document.querySelector('#free_play_tab > #wait');
            if(node && node.style.display == 'none') return resolve({ element: node });

            if(count >= countMax) return reject({
                message: 'no time wait element',
                reload: false
            });

            setTimeout(() => timeStart.call(null, count + 1), 1000);
        }

        timeStart(time);
    }),
    validHumanCaptcha: () => new Promise((resolve, reject) => {
        var countMax = 8;
        var timeStart = count => {
            var iframe = document.querySelectorAll('iframe');
            var node = iframe[iframe.length - 1].parentElement.parentElement;
    
            if(node.style.opacity == "1" && node.style.visibility == 'visible') return resolve(true);

            if(count >= countMax) return reject('no se puedo validad hay un error');

            setTimeout(() => timeStart.call(null, count + 1), 250);
        }

        timeStart(0);
    })
}

var utilsFunc = {
    clickRoll: callback =>  {
        var button = document.getElementById('free_play_form_button');

        if(button.style.display != 'none') {
            button.click();
            if(typeof callback != 'undefined') callback(true); 
            return;
        }

        if(typeof callback != 'undefined') callback(false);
    },
    showWithoutCapctcha: callback =>  {
        var button = document.getElementById('play_without_captchas_button');

        if(button) {
            button.click();
            return callback(true);
        }

        callback(false);
    },
    getCountCaptca: callback => {
        chrome.storage.sync.get('countHumanResolve', res => {
            if(!('countHumanResolve' in res)) return chrome.storage.sync.set({ countHumanResolve: 1 }, () => {
                if(typeof callback != 'undefined') callback.call(null, 1);        
            })

            chrome.storage.sync.set({ countHumanResolve: res.countHumanResolve + 1}, () => {
                if(typeof callback != 'undefined') callback.call(null, res.countHumanResolve + 1);
            })
        })
    },
    clearCountResolve: () => {
        chrome.storage.sync.remove('countHumanResolve', () => {
            if(chrome.runtime.lastError) console.error(chrome.runtime.lastError);
        })
    },
    isShow: isShow => {
        if(isShow) {
            utilsFunc.clickRoll();
            utilsFunc.clearCountResolve();
        }
    }
}

var init_events = () => {
    let countReset = 15;

    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

        /*if(request.action == "validHuman" && request.page == "page_freecoint") {
            sendResponse(validHumanCaptcha());
        }*/
    
        if(request.action == "clickRoll" && request.page == "page_freecoint") {
            utilsFunc.clickRoll(isClick => sendResponse(isClick));
        }
        
    });
    
    window.addEventListener("message", async event => {
        if(event.origin.indexOf('newassets') == -1) return;
    
        try {
            if(event.data.action == 'validHuman' && event.data.pageContent == 'page_freecoint') {
                var valid = await utilsPromise.validHumanCaptcha();
    
                if(valid) {
                    utilsFunc.getCountCaptca(count => {
                        if(count >= countReset) return utilsFunc.showWithoutCapctcha(utilsFunc.isShow);
                        
                        window.location.reload();
                    })
    
                    return;
                }
                
                window.location.reload();
            }   
        } catch (error) {
            console.error(error);
        }
      
    }, false);
}

var init = async () => {

    try {
        var time = await utilsPromise.timeWait();
        var iframeUrl = await utilsPromise.frame();
        console.log('qqqqqqqqqqqq', time.element);
        if(iframeUrl != '') {
            chrome.runtime.sendMessage({ 
                event: "inyectScrips",
                content: { iframeUrl }
            });
        }
    } catch ({message, reload}) {
        console.log('Error ->', message);
        if(reload) window.location.reload();
    }
}

init_events();
init();