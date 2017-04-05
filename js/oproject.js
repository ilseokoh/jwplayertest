(function () {
    jwplayer.key = "PIowX3TUsIpHoErK68P3XNWtyMU/gpbuonLbtXvDllg=";
    var w = 720;
    var h = 480;
    var bufferingcount = 0;
    $('#bufferingcount').text("bufferingcount: " + bufferingcount);

    $(window).resize(function () {
        // 사이즈 측정해서 Player 크기 조정
        w = $('#playercontainer').width();
        h = $('#playercontainer').height();
    });
    var content = $('#videoplayer').attr("data-url");
    var poster = $('#videoplayer').attr("data-img");
    var playerInstance = jwplayer("videoplayer");
    playerInstance.setup({
        width: w,
        height: h,
        autostart: "false",
        "primary": "flash",
        "hlshtml": false,
        "image": poster,
        "mediaid": "oproject1",
        "title": "1988 e01",
        file: content,
    });

    playerInstance.on('bufferChange', function (data) {
        var currpos = (data.position / data.duration) * 100;
        var bufferedDiff = data.bufferPercent - currpos;
        //console.log("Remain buffer: " + bufferedDiff + "%");
        $('#buffer').text("buffer: " + bufferedDiff + "%");
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

    //playerInstance.on('meta', function (e) {
    //    if (e.metadata.streamType != null && e.metadata.streamType == "VOD") {
    //        console.log("meta: loadtime " + "&loadtime=" + e.metadata.segment.loadTime + "&network=" + e.metadata.bandwidth + "&bandwidth=" + e.metadata.segment.bandwidth + "&duration=" + e.metadata.segment.duration + "&width=" + e.metadata.width + "&size=" + parseInt(e.metadata.segment.size / 8));
    //    }
    //});

    playerInstance.on('firstFrame', function (event) {
        console.log("firstframe: " + event.loadTime + "ms");
        $('#firstframe').text("firstframe: " + event.loadTime + "ms");
    });

    playerInstance.on('buffer', function (event) {
        console.log("buffering occurred: from " + event.oldstate + " to " + event.newstate + " because of " + event.reason)
        if (event.reason != 'loading' || event.reason != 'complete') {
            bufferingcount += 1;
            $('#bufferingcount').text("bufferingcount: " + bufferingcount + "(원인:" + event.reason);
        }
        
    });

    playerInstance.on('complete', function (event) {
        console.log("complete: " + event.message);
    });

    playerInstance.on('error', function (event) {
        console.log("error: " + event.message);
    });

    var levels;
    playerInstance.on('levels', function (e) {
        levels = e.levels;
    });

    playerInstance.on('levelsChanged', function (e) {
        console.log("current quality: " + levels[e.currentQuality]);
    });

    playerInstance.on('visualQuality', function (e) {
        console.log("visual quality changed: " + e.label + " because " + e.reason);
        $('#quality').text("visual quality: " + e.label);
    });

}());