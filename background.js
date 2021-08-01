var has = Object.prototype.hasOwnProperty
    , prefix = '~';

function Events() {}

if (Object.create) {
    Events.prototype = Object.create(null);
    if (!new Events().__proto__) prefix = false;
}

function EE(fn, context, once) {
    this.fn = fn;
    this.context = context;
    this.once = once || false;
}

function addListener(emitter, event, fn, context, once) {
    if (typeof fn !== 'function') {
        throw new TypeError('The listener must be a function');
    }

    var listener = new EE(fn, context || emitter, once)
    , evt = prefix ? prefix + event : event;

    if (!emitter._events[evt]) emitter._events[evt] = listener, emitter._eventsCount++;
    else if (!emitter._events[evt].fn) emitter._events[evt].push(listener);
    else emitter._events[evt] = [emitter._events[evt], listener];

    return emitter;
}

function clearEvent(emitter, evt) {
    if (--emitter._eventsCount === 0) emitter._events = new Events();
    else delete emitter._events[evt];
}

function EventEmitter() {
    this._events = new Events();
    this._eventsCount = 0;
}

EventEmitter.prototype.eventNames = function eventNames() {
    var names = []
    , events
    , name;

    if (this._eventsCount === 0) return names;

    for (name in (events = this._events)) {
        if (has.call(events, name)) names.push(prefix ? name.slice(1) : name);
    }

    if (Object.getOwnPropertySymbols) {
        return names.concat(Object.getOwnPropertySymbols(events));
    }

    return names;
};

EventEmitter.prototype.listeners = function listeners(event) {
    var evt = prefix ? prefix + event : event
    , handlers = this._events[evt];

    if (!handlers) return [];
    if (handlers.fn) return [handlers.fn];

    for (var i = 0, l = handlers.length, ee = new Array(l); i < l; i++) {
        ee[i] = handlers[i].fn;
    }

    return ee;
};

EventEmitter.prototype.listenerCount = function listenerCount(event) {
    var evt = prefix ? prefix + event : event
    , listeners = this._events[evt];

    if (!listeners) return 0;
    if (listeners.fn) return 1;
    return listeners.length;
};

EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
    var evt = prefix ? prefix + event : event;

    if (!this._events[evt]) return false;

    var listeners = this._events[evt]
    , len = arguments.length
    , args
    , i;

    if (listeners.fn) {
        if (listeners.once) this.removeListener(event, listeners.fn, undefined, true);

        switch (len) {
            case 1: return listeners.fn.call(listeners.context), true;
            case 2: return listeners.fn.call(listeners.context, a1), true;
            case 3: return listeners.fn.call(listeners.context, a1, a2), true;
            case 4: return listeners.fn.call(listeners.context, a1, a2, a3), true;
            case 5: return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
            case 6: return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
        }

        for (i = 1, args = new Array(len -1); i < len; i++) {
            args[i - 1] = arguments[i];
        }

        listeners.fn.apply(listeners.context, args);
    } else {
        var length = listeners.length
        , j;

        for (i = 0; i < length; i++) {
            if (listeners[i].once) this.removeListener(event, listeners[i].fn, undefined, true);

            switch (len) {
            case 1: listeners[i].fn.call(listeners[i].context); break;
            case 2: listeners[i].fn.call(listeners[i].context, a1); break;
            case 3: listeners[i].fn.call(listeners[i].context, a1, a2); break;
            case 4: listeners[i].fn.call(listeners[i].context, a1, a2, a3); break;
            default:
                if (!args) for (j = 1, args = new Array(len -1); j < len; j++) {
                args[j - 1] = arguments[j];
                }

                listeners[i].fn.apply(listeners[i].context, args);
            }
        }
    }

    return true;
};


EventEmitter.prototype.on = function on(event, fn, context) {
    return addListener(this, event, fn, context, false);
};

EventEmitter.prototype.once = function once(event, fn, context) {
    return addListener(this, event, fn, context, true);
};

EventEmitter.prototype.removeListener = function removeListener(event, fn, context, once) {
    
    var evt = prefix ? prefix + event : event;

    if (!this._events[evt]) return this;
    if (!fn) {
      clearEvent(this, evt);
      return this;
    }

    var listeners = this._events[evt];

    if (listeners.fn) {
      if (
        listeners.fn === fn &&
        (!once || listeners.once) &&
        (!context || listeners.context === context)
      ) {
        clearEvent(this, evt);
      }
    } else {
      for (var i = 0, events = [], length = listeners.length; i < length; i++) {
        if (
          listeners[i].fn !== fn ||
          (once && !listeners[i].once) ||
          (context && listeners[i].context !== context)
        ) {
          events.push(listeners[i]);
        }
      }

      //
      // Reset the array, or remove it completely if we have no more listeners.
      //
      if (events.length) this._events[evt] = events.length === 1 ? events[0] : events;
      else clearEvent(this, evt);
    }

    return this;
};

EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
    var evt;

    if (event) {
      evt = prefix ? prefix + event : event;
      if (this._events[evt]) clearEvent(this, evt);
    } else {
      this._events = new Events();
      this._eventsCount = 0;
    }

    return this;
};

EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
EventEmitter.prototype.addListener = EventEmitter.prototype.on;
EventEmitter.prefixed = prefix;

//start page scrips
const bootPageScript = function (opts = {}) {
    let self = this;
    self.freecointUrlPage = !opts.pageUrl ? 'https://freebitco.in/' : opts.pageUrl;
    self.pageTitle = !opts.pageTitle ? 'FreeBitco.in' : opts.pageTitle;
    self.windowId = chrome.windows.WINDOW_ID_CURRENT;
    self.eveEmitter = new EventEmitter();

    //add event listener
    self.onEvent = (ev, fn) => self.eveEmitter.on(ev, fn, self);
    
    //emit event listener
    self.dispatch = (ev, ...args) => self.eveEmitter.emit(ev, ...args);
    
    //is has event listener
    self.hasEvent = ev => self.eveEmitter.eventNames().filter(e => e == ev).length != 0;

    //create events 
    self.events = () => {

        // listener extension installer one
        chrome.runtime.onInstalled.addListener(() => { 
            console.log('install');
            //clear cache storage reset code ext
            self.clearStorageCache(true);

            //init tab freeciont
            self.defaultTabInit();
            
        });

        //change suspense sw
        chrome.runtime.onSuspend.addListener(function() {
            console.log("Unloading.");
            
        });
        
        // change page google chrome pages
        chrome.tabs.onActivated.addListener(tabInfo => { // tabInfo -> tabId, windowdId
            //change icon is freecoint
            self.getStorage(['tabFreeconit', 'isActiveExtension'], res => {
                if(!('tabFreeconit' in res)) self.defaultTabInit();

                if('isActiveExtension' in res && res.isActiveExtension) {
                    
                    self.currentPageTab(tabInfo.tabId, tab => {
                        if(self.isPageFreecoint(tab)) {
                            self.changeIconTab(tabInfo.tabId, '/images/ok.png');
                        } else {
                            self.changeIconTab(tabInfo.tabId, '/images/diss.png');
                        }
                    });
                } else {
                    self.currentPageTab(tabInfo.tabId, tab => {
                        if(self.isPageFreecoint(tab)) {
                            self.changeIconTab(tab.tabId, '/images/check.png');
                        } else {
                            self.changeIconTab(tab.tabId, '/images/close.png');
                        }
                    });
                }
                
            });

             
        });  

        // current page refresh (reload) 
        chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => { 
            //load page // eliminar active
            if (changeInfo.status == 'complete') {
                console.log('complete (refresh) Page event', tab);
                if(tab.title == 'freebitco.in' && tab.active) return chrome.alarms.create('time_reconnect', {
                    when: Date.now() + (1000 * 30)
                });
                
                self.getStorage(['isActiveExtension', 'tabFreeconit'], res => {
                    if(!('tabFreeconit' in res)) {
                        self.defaultTabInit(() => {
                            self.updateAction(tabId, tab, res);
                        });

                        return;
                    }

                    //is page active freecoint
                    self.updateAction(tabId, tab, res);
                });   
            }
        });

        //listener popup & content scrips messages
        chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
            self.dispatch(request.event, request.content, sender, sendResponse);
        });

        
        chrome.alarms.onAlarm.addListener(alarm => {
            let currentTimeDelay = alarm.scheduledTime;

            if(alarm.name == 'time') {
                self.getStorage(['timeData'], res => {
                    console.log('alarm', res);
                    var tab = res.timeData.tab;
                    var details = res.timeData.details;
                    var frameUrl = res.timeData.iframeUrl;
                    let arrFramesIds = details.filter(e => {
                        if(frameUrl != '') return e.url == frameUrl;
                        return e.url.indexOf('newassets') != -1;
                    }).map(wf => wf.frameId);
                    
                    Promise.all([
                        chrome.scripting.executeScript({ // execute frame catpcha
                            target: {
                                tabId: tab.id,
                                frameIds: [frameUrl != '' ? arrFramesIds[0] : arrFramesIds[arrFramesIds.length - 1]]
                            },
                            files: ['content/page_captcha.js'],
                        }),
                        chrome.scripting.executeScript({ // execute dom
                            target: { tabId: tab.id },
                            files: ['content/page_freecoint.js'],
                        })
                    ]).then(v => {
                        self.setStorage({ registerScripts: true });
                    }).catch(self.runError((e, error) => {
                        chrome.tabs.reload(tab.id);
                        console.error('no execute script catpcha capture', e, error);
                    }));  
                    
                }, 'local');
            }

            if(alarm.name == 'time_reconnect') {
                self.getTabFreecoint(tab => {
                    chrome.tabs.reload(tab.id);
                });
            }

        });

        chrome.windows.onCreated.addListener(() => {
            console.log('open window');
            self.clearStorageCache(false, () => {
                self.getStorage('autoActive', res => {
                    if('autoActive' in res && res.autoActive) {
                        console.log('auto active');
                        self.setStorage({ isActiveExtension: res.autoActive });
                    }
                });
            });
            
            
            
        });


        /*chrome.webNavigation.onCompleted.addListener(details => {
            console.log('load frames', details);
        });*/

    }
    
    self.updateAction = (tabId, tab, res) => {
        if(self.isPageFreecoint(tab)) {
            console.log('---------111', tab);
            if('isActiveExtension' in res && res.isActiveExtension) {
                console.log('-----------222', tab);
                //falta si esta activo y el dom esta load inyect content scripts
                //change active estension
                self.changeIconTab(tabId, '/images/ok.png');

                //inyect content scrips
                self.addContentScrips();

                return;
            }

            return self.changeIconTab(tab.tabId, '/images/check.png');
        }

        if(res.isActiveExtension) return self.changeIconTab(tabId, '/images/diss.png');

        self.changeIconTab(tab.tabId, '/images/close.png');

    }

    self.addContentScrips = () => {
        // lo llamo cuando esta cargaada la pagina
        /*primero -> tengo que verificar si la pagina esta en tiempo para no inyectar los scripst
        si no esta en tiempo inyecto los scripts
        */

        console.log('App 1 branch');
        self.getTabFreecoint(tab => {
            console.log('M => addContentScrips -> data: ', tab);
            chrome.scripting.executeScript({ // execute dom
                target: { tabId: tab.id },
                function: function () {
                    var utilsPromise = {
                        frame: () => new Promise((resolve, reject) => {
                            var countMax = 10;
                            var timeStart = count => {
                                var iframeUrl = document.querySelector('iframe');
                                if(typeof iframeUrl != 'undefined') return resolve(iframeUrl.getAttribute('src'));
    
                                if(count >= countMax) return reject('no capture iframe element');
                                 
                                setTimeout(() => timeStart.call(null, count + 1), 1000);
                            }
                            
                            timeStart(0);
                        }),
                        timeWait: () => new Promise((resolve, reject) => {
                            var countMax = 10;
                            var timeStart = count => {
                                var node = document.querySelector('#free_play_tab > #wait');
                                if(node.style.display == 'none') return resolve(true);

                                if(count >= countMax) return reject('no se puedo capture time wait');

                                setTimeout(() => timeStart.call(null, count + 1), 1000);
                            }

                            timeStart(0);
                        })
                    }

                    console.log('qqqqqqqqqqqq', node);
                    Promise.all([
                        utilsPromise.timeWait(),
                        utilsPromise.frame()
                    ]).then((timeWait, iframeUrl) => {
                        console.log('url :: ', iframeUrl);
                        if(timeWait) {
                            chrome.runtime.sendMessage({ 
                                event: "inyectScrips",
                                content: { iframeUrl }
                            });
                        }
                    }).catch(v => {
                        console.error(v);
                        window.location.reload();
                    });
                }
            }).catch(e => {
                chrome.tabs.reload(tab.id);
                console.error('no inyect qqqq', e);
            });
            
        });
        
    } 

    self.addEventLoop = () => {
        
        self.onEvent('inyectScrips', (content, sender, sendResponse) => {
            console.log('prepare -> inyectScrips');
            self.getTabFreecoint(tab => {
                self.getloadFrames(tab).then(details => {
                    console.log('add -> ContentScrips', tab, details);
                    var iframeUrl = typeof content.iframeUrl != 'undefined' ? content.iframeUrl : '';  
                    //add contentd scripts

                    self.setStorage({ 
                        timeData : { tab, details, iframeUrl }
                    }, () => {
                        chrome.alarms.create('time', {
                            when: Date.now() + 1000
                        });
                    }, 'local');   

                }).catch(e => {
                    chrome.tabs.reload(tab.id);
                    console.error('M => addEventLoop E -> ', e);
                });

            });

        });

        self.onEvent('verifyScrips', (content, sender, sendResponse) => {
            console.log('verifyScrips');

            self.getStorage(['isActiveExtension', 'registerScripts'], res => {

                if(('isActiveExtension' in res && res.isActiveExtension) && (!('registerScripts' in res) || !res.registerScripts)) {
                    self.addContentScrips();
                    return;
                }

                self.setStorage({ registerScripts: false });   
            });


            sendResponse("ok");
        });

        self.onEvent('activateExtension', (content, sender, sendMessage) => {

            self.getStorage('isActiveExtension', res => {
                if(!('isActiveExtension' in res)) {
                    self.setStorage({ isActiveExtension: true });
                    return;
                }

                self.setStorage({ isActiveExtension: !res.isActiveExtension });

            });
            
            sendMessage();
        });

        self.onEvent('validHumanCaptcha', (content, sender, sendResponse) => {
            
            self.getTabFreecoint(tab => {
                chrome.tabs.sendMessage(tab.id, {
                    action: content.action,
                    page: content.pageContent
                }, isExist => {
                    console.log('sdsa', isExist);

                    self.setStorage({validHumanExist: isExist});
                    
                });
            });

        });

        self.onEvent('reloadPage', (content, sender, sendResponse) => {

            self.getTabFreecoint(tab => {
                chrome.tabs.reload(tab.id);
            });

        });
        
        self.onEvent('changeIcon', (content, sender, sendResponse) => {
            console.log('changeIcon');

            self.getTabFreecoint(tab => {
                console.log('ddddddd', content);
                if(content.check) {
                    self.changeIconTab(tab.id, '/images/ok.png');
                    return;
                }

                self.changeIconTab(tab.id, '/images/check.png');

                
            });

            sendResponse();
        });

        self.onEvent('clickRoll', (content, sender, sendResponse) => {

            self.getTabFreecoint(tab => {
                chrome.tabs.sendMessage(tab.id, {
                    action: content.action,
                    page: content.pageContent
                }, isClick => {
                    console.log('isClick : ', isClick);
                    if(isClick) {
                        self.getStorage('countRollclick', res => {
                            if(!('countRollclick' in res)) {
                                return self.setStorage({ countRollclick: 1 }, null, 'local');
                            }
    
                            self.setStorage({ countRollclick: res.countRollclick + 1 }, null, 'local');
                        }, 'local');
                    }
                    
                });
            });
            
        });

    }
    
    self.clearStorageCache = (val = false, callback) => {
        if(val) { // solo install extension
            chrome.storage.sync.clear();
            chrome.storage.local.clear();
            return;
        }
        
        Promise.all([
            self.removePromise([
                'isActiveExtension',
                'registerScripts',
                'validHumanExist',
                'tabFreeconit'
            ], 'sync'),
            self.removePromise([
                'timeData',
                'countRollclick'        
            ], 'local')
        ]).then(() => {
            if(typeof callback != 'undefined') callback.call(self);
        }).catch(e => console.error(e));

    }

    ////////////////////////////////
    ////    Functions Utils     ////
    ////////////////////////////////

    self.getloadFrames = tab => new Promise((resolve, reject) => {
        var countMax = 10;
        var checkFrames = count => {
            chrome.webNavigation.getAllFrames({tabId: tab.id}, details => {
                if(details.length >= 3) return resolve(details);

                if(count >= countMax) return reject('no se obtuvieron los 3 frames');

                setTimeout(() => checkFrames.call(null, count + 1), 1000);
            }); 
        }

        checkFrames(0);    
    });

    self.removePromise = (v, type) => new Promise((resolve, reject) => {
        chrome.storage[type].remove(v, () => {
            if(!chrome.runtime.lastError) return resolve();
            reject(chrome.runtime.lastError);
        })
    });

    self.defaultTabInit = callback => {
        chrome.tabs.query({
            windowId: self.windowId
        }, tabs => {
            let tab = {};
            if((tab = tabs.filter(tab => tab.url.indexOf(self.freecointUrlPage) != -1)).length) {
                console.log(tab);
                self.setStorage({ tabFreeconit: tab[0] }, () => {
                    if(typeof callback != 'undefined') callback.call(self, tab[0]);
                });
            }
        });
    }

    self.isPageFreecoint = tab => {
        if(tab.url.indexOf(self.freecointUrlPage) != -1 && tab.title.indexOf(self.pageTitle) != -1) return true;
        return false;       
    }

    self.currentPageTab = (tabId, callback) => chrome.tabs.get(tabId, callback);

    self.getTabFreecoint = callback => self.getStorage('tabFreeconit', res => callback.call(self, res.tabFreeconit));

    self.changeIconTab = (tabId, iconpath, callback) => {
        chrome.action.setIcon({
            path: iconpath,
            tabId: tabId
        }, () => {
            if(typeof callback != 'undefined') callback.call(self);
        });
    }

    self.runError = callback => (function (e) {
        let error = null;
        if ((error = chrome.runtime.lastError)) console.warn('run error', error);
        
        if(typeof callback != 'undefined') callback.call(this, e, error);
    });

    // storage type => args -> type: (sync || local)
    self.getStorage = (key, callback, type = 'sync') => chrome.storage[type].get(key, callback);
    self.setStorage = (items, callback, type = 'sync') => chrome.storage[type].set(items, () => {
        if (!chrome.runtime.lastError) {
            if(self.isFunction(callback)) callback.call(self);
            return;
        };
        console.warn('set storage: ', chrome.runtime.lastError);
    });

    self.isFunction = obj => typeof obj == 'function' || false;

    // init
    self.startScript = () => {
        console.log('startScript');
        //initEvents 
        self.events();

        //add events
        self.addEventLoop();
    }
}

new bootPageScript().startScript(); // start