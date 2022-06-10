
chrome.runtime.onMessage.addListener(function (request, sender, callback) {
	switch (request.msg) {
		case "getPageDetails":
			var size = {
				width: Math.max(
					document.documentElement.clientWidth,
					document.body.scrollWidth,
					document.documentElement.scrollWidth,
					document.body.offsetWidth,
					document.documentElement.offsetWidth
				),
				height: Math.max(
					document.documentElement.clientHeight,
					document.body.scrollHeight,
					document.documentElement.scrollHeight,
					document.body.offsetHeight,
					document.documentElement.offsetHeight
				)
			};
			chrome.extension.sendMessage({
				"msg": "setPageDetails",
				"size": size,
				"scrollBy": window.innerHeight,
			});
			break;
		case "scrollPage":
			var lastCapture = false;

			window.scrollTo(0, request.scrollTo);

			// first scrolling
			if (request.scrollTo === 0) {
				document.querySelector("body").style.overflow = "hidden";
			}

			if (request.scrollTo != 0) {
				let div = document.body.getElementsByTagName("*");
				for (i = 0; i < div.length; i++) {
					let divStyle = window.getComputedStyle(div[i]);
					if (
						divStyle.getPropertyValue("position") == "fixed !important" ||
						divStyle.getPropertyValue("position") == "fixed" || divStyle.getPropertyValue("position") == "sticky"
					) {
						div[i].style.setProperty("position", "static", "important");
					}
				}
			}

			// last scrolling
			if (request.size.height <= request.scrollTo) {
				lastCapture = true;
				request.scrollTo = request.size.height - request.scrollBydetail;
			}

			chrome.extension.sendMessage({
				"msg": "capturePage",
				"position": request.scrollTo,
				"lastCapture": lastCapture
			});
			break;
		case "resetPage":
			window.location.reload();
			break;
		case "screenshots":
			document.body.style.cursor = 'crosshair';

			document.body.style.position = "relative";

			modalElement = document.createElement('div');
			modalElement.classList.add('test');
			modalElement.style.background = 'transparent';
			modalElement.style.position = 'absolute';
			modalElement.style.top = '0px';
			modalElement.style.left = '0px';
			modalElement.style.width = '100%';
			modalElement.style.height = '100%';
			modalElement.style.zIndex = "1000000";
			document.body.appendChild(modalElement);
		
			document.addEventListener('mousedown', mouseDown)
			break;
	}
});

var modalElement, newElement, startCursor, startY, gdiff, x, y;

const mouseDown = (e) => {
	e.preventDefault();

	startCursor = { x: e.pageX, y: e.pageY };
	startY = e.y;

	newElement = document.createElement('div');
	newElement.style.background = 'white';
	newElement.style.border = "dashed"
	newElement.style.opacity = '0.5';
	newElement.style.position = 'absolute';

	newElement.style.width = "0px";
	newElement.style.height = "0px";
	newElement.style.zIndex = "1000000000";
	document.body.appendChild(newElement);

	document.addEventListener('mousemove', mouseMove);
	document.addEventListener('mouseup', mouseUp);
}

const mouseMove = (e) => {
	e.preventDefault();
	var endCursor = { x: e.pageX, y: e.pageY };
	var endY = e.y
	// (Top left - > bottom right )
	if (endCursor.x > startCursor.x && endCursor.y > startCursor.y) {
		newElement.style.left = startCursor.x + 'px';
		newElement.style.top = startCursor.y + 'px';
		var diff = { x: endCursor.x - startCursor.x, y: endCursor.y - startCursor.y };
		gdiff = diff;
		x = startCursor.x;
		y = startY;
	}
	// (Bottom right -> top left)
	else if (endCursor.x < startCursor.x && endCursor.y < startCursor.y) {
		newElement.style.left = endCursor.x + 'px';
		newElement.style.top = endCursor.y + 'px';
		var diff = { x: startCursor.x - endCursor.x, y: startCursor.y - endCursor.y };
		gdiff = diff;
		x = endCursor.x;
		y = endY;
	}
	// (bottom left -> top right)
	else if (endCursor.x > startCursor.x && endCursor.y < startCursor.y) {
		newElement.style.left = startCursor.x + 'px';
		newElement.style.top = endCursor.y + 'px';
		var diff = { x: endCursor.x - startCursor.x, y: startCursor.y - endCursor.y };
		gdiff = diff;
		x = startCursor.x;
		y = endY;
	}

	// (top right -> bottom left)
	else if (endCursor.x < startCursor.x && endCursor.y > startCursor.y) {
		newElement.style.left = endCursor.x + 'px';
		newElement.style.top = startCursor.y + 'px';
		var diff = { x: startCursor.x - endCursor.x, y: endCursor.y - startCursor.y };
		gdiff = diff;
		x = endCursor.x;
		y = startY;
	}

	newElement.style.width = gdiff.x + 'px';
	newElement.style.height = gdiff.y + 'px';

	return false;
}

const mouseUp = (e) => {
	e.preventDefault();
	document.removeEventListener('mousemove', mouseMove);
	document.removeEventListener('mouseup', mouseUp);

	modalElement.parentNode.removeChild(modalElement);
	newElement.parentNode.removeChild(newElement);
	setTimeout(function () {
		var coords = {
			w: gdiff.x,
			h: gdiff.y,
			x: x,
			y: y
		};
		sendMessageCoords(coords)
	}, 50);
}

const sendMessageCoords = (coords) => {
	document.removeEventListener('mousedown', mouseDown)
	document.body.style.cursor = 'default';
	chrome.extension.sendMessage({
		"msg": "mouseup",
		"coords": coords
	});
}
