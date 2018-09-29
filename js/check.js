browser.runtime.onMessage.addListener(function (msg) {
    if (msg.msg === 'check') {
        var body = document.getElementsByTagName('body')[0];
        var ver = body.getAttribute('youdao');
        if (!ver) {
            browser.runtime.sendMessage({
                id: msg.id,
                result: 'isNotInsert'
            });
        } else {
            browser.runtime.sendMessage({
                id: msg.id,
                result: 'Insert'
            });
        }
    }
} );
