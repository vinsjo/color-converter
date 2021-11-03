"use strict";
/**
 * @module Utils
 */

export {
	getWindowSize,
	mouseOffset,
	isObject,
	isHtmlElement,
	isVoidElement,
	getVoidTags,
	clearChildNodes,
	setClassList,
};

function getWindowSize() {
	return {
		w: window.innerWidth,
		h: window.innerHeight,
	};
}

function mouseOffset(canvas, event) {
	let rect = canvas.getBoundingClientRect();
	let scaleX = canvas.width / rect.width;
	let scaleY = canvas.height / rect.height;
	return {
		x: (event.clientX - rect.left) * scaleX,
		y: (event.clientY - rect.top) * scaleY,
	};
}

function isObject(val) {
	if (val === null) {
		return false;
	}
	return typeof val === "function" || typeof val === "object";
}

/**
 * Determine if object is a HTMLElement or not
 *
 * @function isHtmlElement
 * @param   {any} x
 * @return {Boolean}  True if val is an instance of HTMLElement or hase nodeType 1
 */
function isHtmlElement(x) {
	if (x instanceof HTMLElement) return true;
	return !!(
		x &&
		typeof x === "object" &&
		x !== null &&
		x.nodeType === 1 &&
		typeof x.nodeName === "string"
	);
}

/**
 * Get all self-enclosing HTML tags
 * Source: https://www.w3.org/TR/2011/WD-html-markup-20110113/syntax.html
 *
 * @function getVoidTags
 * @param  {Boolean} [upperCase]  decides if output will be uppercase or not, default is false
 * @return {String[]}             an array containing all tags as strings
 */
function getVoidTags(upperCase = false) {
	const tagNames = [
		"area",
		"base",
		"br",
		"col",
		"command",
		"embed",
		"hr",
		"img",
		"input",
		"keygen",
		"link",
		"meta",
		"param",
		"source",
		"track",
		"wbr",
	];
	if (upperCase) {
		for (let i = 0; i < tagNames.length; i++) {
			tagNames[i] = tagNames[i].toUpperCase();
		}
	}
	return tagNames;
}

/**
 * Determine if a HTMLElement is self-enclosing or not
 *
 * @function isVoidElement
 * @param  {HTMLElement} htmlElement
 * @return {Boolean}
 */
function isVoidElement(htmlElement) {
	if (!isHtmlElement(htmlElement) || !htmlElement.tagName) return false;
	const voidTags = getVoidTags(true);
	if (voidTags.includes(htmlElement.tagName)) {
		return true;
	}
	return false;
}

/**
 * Removes all child elements / nodes from a parent element
 *
 * @function clearChildNodes
 * @param {HTMLElement} htmlElement  the parent element to remove children from
 * @return {void}
 */
function clearChildNodes(htmlElement) {
	if (
		!isHtmlElement(htmlElement) ||
		!htmlElement.childNodes ||
		htmlElement.childNodes.length == 0
	) {
		return;
	}
	while (htmlElement.childNodes.length > 0) {
		htmlElement.removeChild(htmlElement.lastChild);
	}
}

function setClassList(htmlElement, classList, preserve = false) {
	if (
		!isHtmlElement(htmlElement) ||
		!Array.isArray(classList) ||
		classList.length == 0
	) {
		return;
	}
	if (!preserve && htmlElement.classList.length > 0) {
		while (htmlElement.classList.length > 0) {
			htmlElement.classList.remove(htmlElement.classList[0]);
		}
	}
	for (let i = 0; i < classList.length; i++) {
		if (typeof classList[i] !== "string") {
			continue;
		}
		if (preserve && htmlElement.classList.includes(classList[i])) {
			continue;
		}
		htmlElement.classList.add(classList[i]);
	}
}
