let size = {
    width: 0,
    height: 0
};
let scrollBydetail = 0;
let screenshotCanvas = document.createElement("canvas");
let screenshotContext = screenshotCanvas.getContext("2d");
let tabId = '';


document.querySelector(".visible").addEventListener("click", () => {
    document.querySelector(".visible").classList.add('color-rgba');
    document.querySelector(".fullPage").classList.remove('color-rgba');
    document.querySelector(".select").classList.remove('color-rgba');
    chrome.tabs.captureVisibleTab(null, {}, function (dataUrl) {
        localStorage.setItem('Base64string', dataUrl)
        chrome.tabs.create({ url: 'image.html' })
    });
});

chrome.runtime.onMessage.addListener(function (request, sender, callback) {
    if (request.msg === "setPageDetails") {
        size = request.size;
        scrollBydetail = request.scrollBy;

        // set width & height cavans
        screenshotCanvas.width = size.width;
        screenshotCanvas.height = size.height;

        fuctionScrollTo(0);
    }else if (request.msg === "capturePage") {
        capturePage(request.position, request.lastCapture);
    }
});

const fuctionScrollTo = (position) => {
    chrome.tabs.sendMessage(tabId, {
        "msg": "scrollPage",
        "size": size,
        "scrollBydetail": scrollBydetail,
        "scrollTo": position
    });
}

const capturePage = (position, lastCapture) => {
    setTimeout(function () {
        chrome.tabs.captureVisibleTab(null, {}, function (dataURI) {
            image = new Image();

            if (dataURI) {
                image.onload = function () {
                    screenshotContext.drawImage(image, 0, position);
                    if (lastCapture) {
                        resetPage();
                        localStorage.setItem('Base64string', screenshotCanvas.toDataURL("image/jpeg"))
                        chrome.tabs.create({ url: 'image.html' })
                       
                    } else {
                        fuctionScrollTo(position + scrollBydetail);
                    }
                };
                image.src = dataURI;
            } else {
                alert('error')
            }
        });
    }, 1000);
}

const resetPage = () => {
    chrome.tabs.sendMessage(tabId, {
        "msg": "resetPage",
    });
}

document.querySelector(".fullPage").addEventListener("click", () => {
    document.querySelector(".visible").classList.remove('color-rgba');
    document.querySelector(".fullPage").classList.add('color-rgba');
    document.querySelector(".select").classList.remove('color-rgba');
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        tabId = tabs[0].id;
        chrome.tabs.sendMessage(tabs[0].id, { "msg": "getPageDetails" });
    });
});

document.querySelector(".select").addEventListener("click", () => {
    document.querySelector(".visible").classList.remove('color-rgba');
    document.querySelector(".fullPage").classList.remove('color-rgba');
    document.querySelector(".select").classList.add('color-rgba');
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { "msg": "screenshots", "size": size});
    });
});

document.querySelector(".capture").addEventListener("click", () => {
    document.querySelector(".capture").classList.remove('disble');
    document.querySelector(".record").classList.add('disble');
    document.querySelector(".funtion-capture").style.display = 'block';
    document.querySelector(".funtion-record").style.display = 'none';
});
document.querySelector(".record").addEventListener("click", () => {
    document.querySelector(".record").classList.remove('disble');
    document.querySelector(".capture").classList.add('disble');
    document.querySelector(".funtion-capture").style.display = 'none';
    document.querySelector(".funtion-record").style.display = 'block';
});

