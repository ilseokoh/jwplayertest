(function () {
    jwplayer.key = "PIowX3TUsIpHoErK68P3XNWtyMU/gpbuonLbtXvDllg=";
    var w = 720;
    var h = 480;
    var bufferingcount = 0;
    $('#bufferingcount').text("bufferingcount: " + bufferingcount);

    $(window).resize(function () {
        // 사이즈 측정해서 Player 크기 조정
        var w = $('#playercontainer').width();
        var h = w * 9 / 16;
        playerInstance.resize(w, h);
    });

    var content = $('#videoplayer').attr("data-url");
    var poster = $('#videoplayer').attr("data-img");
    var playerInstance = jwplayer("videoplayer");
    

    playerInstance.setup({
        width: w,
        height: h,
        autostart: "true",
        "primary": "flash",
        "hlshtml": false,
        "image": poster,
        "mediaid": "oproject1",
        "title": "O Project",
        file: content,
    });

    playerInstance.on('playlist', function (data) {
        var w = $('#playercontainer').width();
        //h = $('#playercontainer').height();
        var h = w * 9 / 16;
        playerInstance.resize(w, h);

    });

    playerInstance.on('bufferChange', function (data) {
        var currpos = (data.position / data.duration) * 100;
        var bufferedDiff = data.bufferPercent - currpos;
        //console.log("Remain buffer: " + bufferedDiff + "%");
        $('#buffer').text("buffer: " + bufferedDiff.toFixed(2) + " %");
    });

    var time1 = 0;
    playerInstance.on('beforePlay', function () {
        if (time1 == 0) time1 = (new Date().getTime() / 1000);
        console.log("provider: " + playerInstance.getProvider().name)
    });

    var first_play = true;
    playerInstance.on('play', function (e) {
        if (first_play) {
            first_play = false;
            // TODO: Generate ID and log here
            console.log("first play : " + new Date());
            console.log("getCurrentQuality: " + playerInstance.getCurrentQuality());
        }
    });

    playerInstance.on('setupError', function (event) {
        console.log("setupError: " + event.message);
    });

    playerInstance.on('firstFrame', function (event) {
        console.log("firstframe: " + event.loadTime + "ms");
        $('#firstframe').text("firstframe: " + parseInt(event.loadTime) + " ms");

        var properties = {
            StreamId: content || "unknown",
            sessionid: sessionid,
            Sdn: $('#sdn').text() || "none",
            'currentTime': playerInstance.getPosition(),
        };

        trackEvent("firstframe", properties, { "time": event.loadTime });
    });

    playerInstance.on('buffer', function (event) {
        console.log("buffering occurred: from " + event.oldstate + " to " + event.newstate + " because of " + event.reason);
        $('#bufferingcount').text("Buffering count: " + bufferingcount + " (원인:" + event.reason + ")");

        var properties = {
            StreamId: content || "unknown",
            sessionid: sessionid,
            Sdn: $('#sdn').text() || "none",
            'currentTime': playerInstance.getPosition(),
            "reason": event.reason || "unknown",
            "oldstate": event.oldstate || "unknown",
            "newstate": event.newstate || "unknown"
        };

        bufferingcount += 1;
        trackEvent('buffer', properties, { "count": bufferingcount});

        if (event.reason == "stalled") {
            trackEvent('rebuffer', properties, {});
        }
    });

    playerInstance.on('complete', function (event) {
        console.log("complete: " + event.message);
        var nexturl = $('#nexturl').attr('href');

        window.location.href = nexturl;
    });

    playerInstance.on('error', function (event) {
        console.log("error: " + event.message);

        var properties = {
            StreamId: content || "unknown",
            sessionid: sessionid,
            Sdn: $('#sdn').text() || "none",
            'currentTime': playerInstance.getPosition(),
            "message": event.message,
        };
        trackEvent("error", properties, {});
    });

    playerInstance.on('visualQuality', function (e) {
        console.log("visual quality changed: " + e.level.width + "x" + e.level.height + " because " + e.reason);
        $('#quality').text("visual quality: " + e.level.width + "x" + e.level.height + " (원인:" + e.reason + ")");
        var properties = {
            StreamId: content || "unknown",
            sessionid: sessionid,
            Sdn: $('#sdn').text() || "none",
            'currentTime': playerInstance.getPosition(),
            "dimension": e.level.width + "x" + e.level.height,
            "reason": e.reason || "unknown"
        };
        trackEvent("visualQuality", properties, {});
    });

    var generateUUID = function() {
        var d = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
        return uuid;
    };

    var streamId = content;
    var pluginVersion = "0.2";
    var playerversion = playerInstance.version.split(".")[0]
    var debug = true;
    var sessionid = generateUUID();



    var trackEvent = function (event, properties, metricsObj) {
        if (window.appInsights) {
            var metrics = metricsObj || {};

            appInsights.trackEvent(event, properties, metrics);

            if (debug) {
                console.log("sent to Application Insights...'event': " + event + "\n'properties': " + JSON.stringify(properties) + "\n'metrics': " + JSON.stringify(metrics));
            }

        } else if (options.debug) {
            console.log("App Insights not detected");
        }
    }

}());