var CONST = {
		ORIENTATION_HORIZONTAL: "horizontal",
		ORIENTATION_VERTICAL: "vertical",
		POSITION_ABSOLUTE: "absolute",
		POSITION_FIXED: "fixed"
	},

	dom = {},
	activeLine = null,
	newLineProps = {},

	isVisible,

	init = function () {
		initDom();
		addListeners();

		document.body.appendChild(dom.container);
		isVisible = true;
	},

	initDom = function () {
		dom.container = document.createElement("div");
		dom.scaleH = document.createElement("div");
		dom.scaleV = document.createElement("div");
		dom.scaleHTypeSelect = document.createElement("select");
		dom.scaleVTypeSelect = document.createElement("select");
		dom.navBtn = document.createElement("div");

		dom.container.id = "chrome-guidelines";

		dom.scaleH.setAttribute("class", "chrome-guidelines-scale chrome-guidelines-scale-h");
		dom.scaleV.setAttribute("class", "chrome-guidelines-scale chrome-guidelines-scale-v");

		dom.scaleHTypeSelect.setAttribute("class", "chrome-guidelines-scale-type chrome-guidelines-scale-type-h");
		dom.scaleVTypeSelect.setAttribute("class", "chrome-guidelines-scale-type chrome-guidelines-scale-type-v");

		dom.navBtn.setAttribute("class", "chrome-guidelines-nav-btn");

		dom.scaleHTypeSelect.innerHTML = "<option value=\"" + CONST.POSITION_ABSOLUTE + "\">Absolute</option>" +
														"<option value=\"" + CONST.POSITION_FIXED + "\">Fixed</option>";


		dom.scaleVTypeSelect.innerHTML = "<option value=\"" + CONST.POSITION_ABSOLUTE + "\">Absolute</option>" +
														"<option value=\"" + CONST.POSITION_FIXED + "\">Fixed</option>";

		dom.scaleH.appendChild(dom.scaleHTypeSelect);
		dom.scaleV.appendChild(dom.scaleVTypeSelect);

		dom.container.appendChild(dom.scaleH);
		dom.container.appendChild(dom.scaleV);
		dom.container.appendChild(dom.navBtn);
	},

	addListeners = function () {
		dom.scaleH.addEventListener("mousedown", onScaleMouseDown, false);
		dom.scaleV.addEventListener("mousedown", onScaleMouseDown, false);
		dom.navBtn.addEventListener("click", onNavBtnClick, false);

		window.addEventListener("resize", watchSize, false);
		document.addEventListener("DOMSubtreeModified", watchSize, false);

		chrome.extension.onMessage.addListener(onChromeEvents);
	},

	onScaleMouseDown = function (e) {
		if (e.target === dom.scaleH) {
			newLineProps.orientation = CONST.ORIENTATION_HORIZONTAL;
			newLineProps.position = dom.scaleHTypeSelect.value;
		} else if (e.target === dom.scaleV) {
			newLineProps.orientation = CONST.ORIENTATION_VERTICAL;
			newLineProps.position = dom.scaleVTypeSelect.value;
		} else {
			return;
		}

		preventEvent(e);
		drag();
	},

	drag = function () {
		window.addEventListener("mousemove", onMouseMove);
		window.addEventListener("mouseup", onDragStop);
	},

	onMouseMove = function (e) {
		if (!activeLine) {
			newActiveLine();
			activeLine.classList.add("moving");
			dom.navBtn.classList.add("chrome-guidelines-nav-btn-active");
			dom.container.appendChild(activeLine);
		}

		if (activeLine.dataset.orientation === CONST.ORIENTATION_HORIZONTAL) {
			if (activeLine.dataset.position === CONST.POSITION_ABSOLUTE) {
				activeLine.style.top = e.pageY + "px";
			} else {
				activeLine.style.top = e.clientY + "px";
			}
		} else {
			if (activeLine.dataset.position === CONST.POSITION_ABSOLUTE) {
				activeLine.style.left = e.pageX + "px";
			} else {
				activeLine.style.left = e.clientX + "px";
			}
		}
	},

	newActiveLine = function () {
		activeLine = document.createElement("div");
		activeLine.dataset.orientation = newLineProps.orientation;
		activeLine.dataset.position = newLineProps.position;

		activeLine.classList.add("chrome-guidelines-line");

		if (newLineProps.orientation === CONST.ORIENTATION_HORIZONTAL) {
			activeLine.classList.add("chrome-guidelines-line-h");
		} else {
			activeLine.classList.add("chrome-guidelines-line-v");
		}

		if (newLineProps.position === CONST.POSITION_ABSOLUTE) {
			activeLine.classList.add("chrome-guidelines-line-abs");
		} else {
			activeLine.classList.add("chrome-guidelines-line-fix");
		}

		activeLine.addEventListener("mousedown", onLineMove, false);
	},

	onLineMove = function (e) {
		preventEvent(e);

		activeLine = e.target;
		activeLine.classList.add("moving");
		dom.navBtn.classList.add("chrome-guidelines-nav-btn-active");

		drag();
	},

	onDragStop = function (e) {
		window.removeEventListener("mousemove", onMouseMove);
		window.removeEventListener("mouseup", onDragStop);

		if (e.clientX < 20 && e.clientY < 20) {
			dom.container.removeChild(activeLine);
		}

		activeLine.classList.remove("moving");
		dom.navBtn.classList.remove("chrome-guidelines-nav-btn-active");

		activeLine = null;
		newLineProps.orientation = "";
		newLineProps.position = "";
	},

	onNavBtnClick = function (e) {
		removeAllLines();
	},

	toggleRulersVisibility = function () {
		dom.scaleH.classList.toggle("chrome-guidelines-hidden");
		dom.scaleV.classList.toggle("chrome-guidelines-hidden");
	},

	watchSize = function (e) {
		var style = window.getComputedStyle(document.body, null);

		dom.container.style.width = style.width;
		dom.container.style.height = style.height;
	},

	onChromeEvents = function(request, sender, sendResponse) {
		if (request.action === "toggle") {
			toggleVisibility();
		}
	},

	toggleVisibility = function () {
		if (isVisible) {
			document.body.removeChild(dom.container);
		} else {
			document.body.appendChild(dom.container);
		}

		isVisible = !isVisible;
	},

	removeAllLines = function () {
		var contChildren = dom.container.children,
			i = 0,
			l = contChildren.length,
			lines = [];

		for ( ; i < contChildren.length; i += 1) {
			if (contChildren[i].classList.contains("chrome-guidelines-line")) {
				lines.push(contChildren[i]);
			}
		}

		while (lines.length) {
			dom.container.removeChild(lines.pop());
		}
	},

	preventEvent = function (e) {
		e.preventDefault();
		e.stopPropagation();
		e.cancelBubble = true;
	};

init();