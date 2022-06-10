
chrome.runtime.onMessage.addListener(function (request, sender, callback) {
    if (request.msg === "mouseup") {
        cropCapture(request.coords)
    }
});

const cropCapture = (coords) => { 
    console.log(coords)
    chrome.tabs.captureVisibleTab(null, {}, function (dataURI) {
        image = new Image();
        if (dataURI) {
            image.onload = function () {
                var canvas = document.createElement('canvas');
                canvas.width = coords.w;
                canvas.height = coords.h;

                var ctx = canvas.getContext('2d');

                ctx.drawImage(image, coords.x, coords.y, coords.w, coords.h, 0, 0, coords.w, coords.h);
                    localStorage.setItem('Base64string', canvas.toDataURL("image/jpeg"))
                    chrome.tabs.create({ url: 'image.html' })
            };

            image.src = dataURI;
        } else {
            alert('error')
        }
    });
}
