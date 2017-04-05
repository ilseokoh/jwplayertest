(function () {
    jwplayer.key = "PIowX3TUsIpHoErK68P3XNWtyMU/gpbuonLbtXvDllg=";
    var w = 720;
    var h = 480;
    $(window).resize(function () {
        // 사이즈 측정해서 Player 크기 조정
        w = $('#playercontainer').width();
        h = $('#playercontainer').height();
    });
    var content = $('#videoplayer').attr("data-url");
    var playerInstance = jwplayer("videoplayer");
    playerInstance.setup({
        width: w,
        height: h,
        autostart: "false",
        "primary": "flash",
        "hlshtml": false,
        "image": "img/1988.jpg",
        "mediaid": "oproject1",
        "title": "1988 e01",
        file: content,
    });

    playerInstance.on('bufferChange', function (data) {
        var currpos = (data.position / data.duration) * 100;
        var bufferedDiff = data.bufferPercent - currpos;
        console.log("Remain buffer: " + bufferedDiff + "%");
    });

    var time1 = 0;
    playerInstance.on('beforePlay', function () {
        if (time1 == 0) time1 = (new Date().getTime() / 1000);
    });

    var first_play = true;
    playerInstance.on('play', function (e) {
        if (first_play) {
            first_play = false;
            // TODO: Generate ID and log here
        }
    });

    playerInstance.on('setupError', function (event) {
        console.log("setupError: " + event.message);
    });

    playerInstance.on('meta', function (e) {
        if (e.metadata.streamType !== undefined && e.metadata.streamType == "VOD") {
            console.log("meta: loadtime " + "&loadtime=" + e.metadata.segment.loadTime + "&network=" + e.metadata.bandwidth + "&bandwidth=" + e.metadata.segment.bandwidth + "&duration=" + e.metadata.segment.duration + "&width=" + e.metadata.width + "&size=" + parseInt(e.metadata.segment.size / 8));
        }
    });

    playerInstance.on('firstFrame', function (event) {
        console.log("firstframe: " + event.loadTime + "ms");
    });

    playerInstance.on('buffer', function (event) {
        console.log("buffering occurred: from " + event.oldstate + " to " + event.newstate + " because of " + event.reason)
    });

    playerInstance.on('complete', function (event) {
        console.log("complete: " + event.message);
    });

    playerInstance.on('error', function (event) {
        console.log("error: " + event.message);
    });
}());