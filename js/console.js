(function () {
    if (!console) {
        console = {};
    }
    var old = console.log;
    console.log = function (message) {
        $('#log').append($('<option>', {
            value: 1,
            text: message
        }));
    }
})();