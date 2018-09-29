var vendor = 'ChromeStore';
var server = document.location.protocol + '//note.youdao.com';
var timer = null;
var count = 0;

function log () {
    var i = new Image();
    i.src = server + '/yws/mapi/ilogrpt?method=putwcplog&chrome_clipper=install&vendor='+ vendor;
    return true;
}

function onInstall() {
    console.log("Extension Installed");
    log();
}

function onUpdate() {
    console.log("Extension Updated");
}

function getVersion() {
    var details = browser.runtime.getManifest();
    return details.version;
}

// Check if the version has changed.
var currVersion = getVersion();
var prevVersion = localStorage['version'];
if (currVersion != prevVersion) {
    // Check if we just installed this extension.
    if (typeof prevVersion == 'undefined') {
      onInstall();
    } else {
      onUpdate();
    }
    browser.browserAction.setIcon({path: "assets/init_19x19.png"});
    localStorage['version'] = currVersion;
}


//gAction:          动作的类型
//gActionOption:    动作所带的参数
var gAciton = null;
var gActionOption = {};

gActionOption.version = getVersion();

browser.contextMenus.create({
    title: browser.i18n.getMessage('pageMenu'),
    contexts: ['page'],
    onclick: function(info, tab) {
        count = 0;
        startClip(tab.id, 'm_clipperPage');
    }
});

browser.contextMenus.create({
    title: browser.i18n.getMessage('selectionMenu'),
    contexts: ['selection'],
    onclick: function(info, tab) {
        count = 0;
        startClip(tab.id, 'm_clipperSelection');
    }
});

browser.contextMenus.create({
    title: browser.i18n.getMessage('clipperImageMenu'),
    contexts: ['image'],
    onclick: function(info, tab){
        count = 0;
        gActionOption.imgSrc = info.srcUrl;
        gActionOption.title = tab.title;
        startClip(tab.id, 'm_clipperImage');
    }
});


browser.browserAction.onClicked.addListener(function(tab) {
    // Check if is first click;
    var firstClick = localStorage['changeLogo'];
    if(typeof firstClick === 'undefined'){
        browser.browserAction.setIcon({path: "assets/logo_19x19.png"});
        localStorage['changeLogo'] = JSON.stringify(false);
    }
    else if(JSON.parse(firstClick)){
        browser.browserAction.setIcon({path: "assets/logo_19x19.png"});
        localStorage['changeLogo'] = JSON.stringify(false);
    }

    browser.tabs.executeScript(tab.id, {file: "js/clipper-min.js"});

    count = 0;
    startClip(tab.id, 'browser');
});

//统计心跳用户
var heartbeatDate = new Date();
var currHeartbeatDate = heartbeatDate.toDateString();
var prevHeartbeatDate = localStorage['heartbeatDate'];
if(currHeartbeatDate !== prevHeartbeatDate){
    //发送消息给服务器
    var i = new Image();
    i.src = server + '/yws/mapi/ilogrpt?method=putwcplog&chrome_status=heartbeat&version=' + getVersion();
    localStorage['heartbeatDate'] = currHeartbeatDate;
}

browser.runtime.onMessage.addListener(function (msg) {
    var tabId = msg.id;
    if (msg.result === 'isNotInsert') {
        var reb = browser.tabs.executeScript(tabId, {file: "js/clipper-min.js"});
        reb.then(function () {
            browser.tabs.sendMessage(tabId, {
                action: gAction,
                option: gActionOption
            });
        });
    } else {
        count++;
        if (count < 2) {
            browser.tabs.sendMessage(tabId, {
                action: gAction,
                option: gActionOption
            });
        }
    }
});

var startClip = function(tabId, action) {
    gAction = action;
    var reb = browser.tabs.executeScript(tabId, {file: "js/check.js"});
    reb.then(function () {
        browser.tabs.sendMessage(tabId, {
            id: tabId,
            msg: 'check'
        });
    });
};
