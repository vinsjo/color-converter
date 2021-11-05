/**
 * @module Color
 * @requires MathUtils
 */

import {
	isInt,
	roundFloat,
	constrain,
	normalize,
	map,
	segmentMap,
	euclideanModulo,
	cubicBezier,
	parabola,
} from "./MathUtils.js";

//#region CONSTANTS
const RGB_RANGE = 255;
const H_RANGE = 360;
const S_RANGE = 100;
const L_RANGE = 100;
const A_RANGE = 100;
const RANGE = {
	get r() {
		return RGB_RANGE;
	},
	get g() {
		return RGB_RANGE;
	},
	get b() {
		return RGB_RANGE;
	},
	get h() {
		return H_RANGE;
	},
	get s() {
		return S_RANGE;
	},
	get l() {
		return L_RANGE;
	},
	get a() {
		return A_RANGE;
	},
};
//#endregion

export {
	Color as default,
	RGB_RANGE,
	H_RANGE,
	S_RANGE,
	L_RANGE,
	A_RANGE,
	RANGE,
	RGB,
	HSL,
	HEX,
	randomRGB,
	isColor,
	isRGB,
	isHSL,
	isHEX,
	toRGB,
	toHEX,
	toHSL,
	RGBToHSL,
	RGBToHEX,
	HSLToRGB,
	HSLToHEX,
	HEXToRGB,
	HEXToHSL,
	colorToString,
	RGBToString,
	HSLToString,
	constrainColor,
	constrainRGB,
	constrainHSL,
	constrainHEX,
	roundColor,
	roundRGB,
	roundHSL,
	invertColor,
	invertRGB,
	invertHSL,
	invertHEX,
	addColor,
	addRGB,
	addHSL,
	addHEX,
	contrastCurve,
	colorCurve,
	brightnessCurve,
	mapColor,
};

//#region INSTANCE
class Color {
	//#region STATIC PROPS
	static get RGB_RANGE() {
		return RGB_RANGE;
	}
	static get H_RANGE() {
		return H_RANGE;
	}
	static get S_RANGE() {
		return S_RANGE;
	}
	static get L_RANGE() {
		return L_RANGE;
	}
	static get A_RANGE() {
		return A_RANGE;
	}
	static get RANGE() {
		return RANGE;
	}
	static RGB = RGB;
	static HSL = HSL;
	static HEX = HEX;
	static randomRGB = randomRGB;
	static isColor = isColor;
	static isRGB = isRGB;
	static isHSL = isHSL;
	static isHEX = isHEX;
	static toRGB = toRGB;
	static toHSL = toHSL;
	static toHEX = toHEX;
	static RGBToHSL = RGBToHSL;
	static RGBToHEX = RGBToHEX;
	static HSLToRGB = HSLToRGB;
	static HSLToHEX = HSLToHEX;
	static HEXToRGB = HEXToRGB;
	static toString = colorToString;
	static RGBToString = RGBToString;
	static HSLToString = HSLToString;
	static constrain = constrainColor;
	static constrainRGB = constrainRGB;
	static constrainHSL = constrainHSL;
	static constrainHEX = constrainHEX;
	static round = roundColor;
	static roundRGB = roundRGB;
	static roundHSL = roundHSL;
	static invert = invertColor;
	static invertRGB = invertRGB;
	static invertHSL = invertHSL;
	static invertHEX = invertHEX;
	static add = addColor;
	static addRGB = addRGB;
	static addHSL = addHSL;
	static addHEX = addHEX;
	static contrastCurve = contrastCurve;
	static colorCurve = colorCurve;
	static brightnessCurve = brightnessCurve;
	static map = mapColor;

	//#endregion

	//#region PROPERTIES
	#r = 0;
	#g = 0;
	#b = 0;
	#a = 1;
	#mode = "RGB";

	//#endregion

	//#region CONSTRUCTOR
	/**
	 * Class constructor
	 *
	 * @method constructor
	 * @param  {Number[] | string} values  number array of color values or a hex string
	 * @param  {String} mode  color mode ("RGB", "HSL" or "HEX"), default is "RGB"
	 * @param  {Number} r  red value between 0 and 255
	 * @param  {Number} g  green value between 0 and 255
	 * @param  {Number} b  blue value between 0 and 255
	 * @param  {Number} a  alpha value between 0 and 100
	 * @return {Color}     returns new Color object
	 */
	constructor(values, mode = "RGB") {
		if (mode == "HSL") {
			this.#mode = "HSL";
			this.RGB = HSLToRGB(HSL.apply(null, [...values, true]));
		} else if (mode == "HEX") {
			this.#mode = "HEX";
			this.RGB = HEXToRGB(values);
		} else {
			this.#mode = "RGB";
			this.RGB = RGB.apply(null, [...values, true]);
		}
	}
	//#endregion

	//#region GETTERS
	get r() {
		return this.#r;
	}
	get g() {
		return this.#g;
	}
	get b() {
		return this.#b;
	}
	get a() {
		return this.#a;
	}

	get RGB() {
		return RGB(this.#r, this.#g, this.#b, this.#a);
	}

	get HSL() {
		return RGBToHSL(this.RGB);
	}

	get HEX() {
		return RGBToHEX(this.RGB);
	}

	get mode() {
		return this.#mode;
	}
	//#endregion

	//#region SETTERS
	set r(r) {
		if (typeof r === "number" && this.#r != r) {
			this.#r = constrain(r, 0, RGB_RANGE);
		}
	}
	set g(g) {
		if (typeof g === "number" && this.#g != g) {
			this.#g = constrain(g, 0, RGB_RANGE);
		}
	}
	set b(b) {
		if (typeof b === "number" && this.#b != b) {
			this.#b = constrain(b, 0, RGB_RANGE);
		}
	}
	set a(a) {
		if (typeof a === "number" && this.#a != a) {
			this.#a = constrain(a, 0, A_RANGE);
		}
	}

	set RGB(c) {
		if (!isRGB(c)) return;
		this.r = c.r;
		this.g = c.g;
		this.b = c.b;
		this.a = c.a;
	}

	set HSL(c) {
		if (!isHSL(c)) return;
		const rgb = HSLToRGB(c);
		this.RGB = rgb;
	}

	set HEX(c) {
		if (!isHEX(c)) return;
		this.RGB = HEXToRGB(c);
	}

	set mode(m) {
		if (typeof m !== "string") return;
		if (m == "RGB") this.#mode = "RGB";
		else if (m == "HSL") this.#mode = "HSL";
		else if (m == "HEX") this.#mode = "HEX";
	}

	set(c) {
		if (isHSL(c)) {
			this.HSL = c;
		} else if (isRGB(c)) {
			this.RGB = c;
		} else if (isHEX(c)) {
			this.HEX = c;
		} else if (Array.isArray(c) && c.length > 0) {
			const rgb = RGB(c[0], c[1], c[2], c[4]);
			this.RGB = rgb;
		} else if (typeof c === "number") {
			const rgb = RGB(c, c, c);
			this.RGB = rgb;
		}
	}
	//#endregion

	//#region MODIFYING METHODS

	invert() {
		return invertColor(this.RGB);
	}

	add(c) {
		if (!c) return;
		if (isRGB(c)) {
			this.RGB = addRGB(this.RGB, c);
		} else if (isHSL(c)) {
			this.HSL = addHSL(this.HSL, c);
		} else if (isHEX(c)) {
			this.HEX = addHEX(this.HEX, c);
		}
	}

	sub(c) {
		if (!c) return;
		if (isRGB(c)) {
			const rgb = RGB(
				c.r ? this.#r - c.r : this.#r,
				c.g ? this.#g - c.g : this.#g,
				c.b ? this.#b - c.b : this.#b
			);
			this.RGB = rgb;
		} else if (typeof c === "number") {
			const rgb = RGB(this.#r - c, this.#g - c, this.#b - c);
			this.RGB = rgb;
		}
	}

	multiply(c) {
		if (!c) return;
		if (isRGB(c)) {
			const rgb = RGB(this.#r * c.r, this.#g * c.g, this.#b * c.b);
			this.RGB = rgb;
		} else if (typeof c === "number") {
			const rgb = RGB(this.#r * c, this.#g * c, this.#b * c);
			this.RGB = rgb;
		}
	}

	contrastCurve(strength = 0.01) {
		const rgb = contrastCurve(this.RGB, strength);
		if (rgb) {
			this.RGB = rgb;
		}
	}

	colorCurve(r, g, b) {
		const strength = RGB(r, g, b);
		const rgb = colorCurve(this.RGB, strength);
		if (rgb) {
			this.RGB = rgb;
		}
	}

	brightnessCurve(strength = 0.01) {
		this.colorCurve(strength, strength, strength);
	}

	//#endregion

	//#region CLONING METHODS

	clone() {
		return new this.constructor(this.r, this.g, this.b, this.a);
	}

	cloneInverted() {
		const c = this.clone();
		c.invert();
		return c;
	}

	//#endregion

	//#region "MAGIC" METHODS
	toString(mode) {
		const m = mode && typeof mode === "string" ? mode : this.mode;
		if (m == "HSL") {
			return HSLToString(this.HSL);
		}
		if (m == "HEX") {
			return this.HEX;
		}
		return RGBToString(this.RGB);
	}

	//#endregion
}
//#endregion

//#region FUNCTIONS

//#region OBJECT CREATION FUNCTIONS
function RGB(r, g, b, a, constrainValues = false) {
	const rgb = {r: 0, g: 0, b: 0, a: typeof a === "number" ? a : A_RANGE};
	if (
		typeof r === "number" &&
		typeof g !== "number" &&
		typeof b !== "number"
	) {
		rgb.r = rgb.g = rgb.b = r;
	} else {
		typeof r === "number" && (rgb.r = r);
		typeof g === "number" && (rgb.g = g);
		typeof b === "number" && (rgb.b = b);
	}
	return constrainValues ? constrainRGB(rgb) : rgb;
}

function HSL(h, s, l, a, constrainValues = false) {
	const hsl = {
		h: typeof h === "number" ? h : 0,
		s: typeof s === "number" ? s : 0,
		l: typeof l === "number" ? l : 0,
		a: typeof a === "number" ? a : A_RANGE,
	};
	return constrainValues ? constrainHSL(hsl) : hsl;
}

function HEX(r, g, b, a, constrainValues = false) {
	const rgb = roundRGB(RGB(r, g, b, a, constrainValues));
	const hex = {
		r: rgb.r.toString(16),
		g: rgb.g.toString(16),
		b: rgb.b.toString(16),
		a: rgb.a != A_RANGE ? rgb.a.toString() : "",
	};
	for (const c in hex) {
		if (hex[c] && hex[c].length < 2) {
			hex[c] = "0" + hex[c];
		}
	}
	return `#${hex.r}${hex.g}${hex.b}${hex.a}`;
}

function randomRGB(min, max) {
	const rgb = RGB(
		Math.random() * RGB_RANGE,
		Math.random() * RGB_RANGE,
		Math.random() * RGB_RANGE
	);
	if (
		typeof min === "number" &&
		typeof max === "number" &&
		(min != 0 || max != RGB_RANGE)
	) {
		for (const c in rgb) {
			rgb[c] = map(rgb[c], 0, RGB_RANGE, min, max);
		}
	}
	return rgb;
}
//#endregion
//#region VALIDATORS

//#region 	IS COLOR
function isColor(c) {
	return isRGB(c) || isHSL(c) || isHEX(c);
}
function isRGB(c) {
	return (
		typeof c === "object" &&
		c.hasOwnProperty("r") &&
		c.hasOwnProperty("g") &&
		c.hasOwnProperty("b") &&
		typeof c.r === "number" &&
		typeof c.g === "number" &&
		typeof c.b === "number"
	);
}

function isHSL(c) {
	return (
		typeof c === "object" &&
		c.hasOwnProperty("h") &&
		c.hasOwnProperty("s") &&
		c.hasOwnProperty("l") &&
		typeof c.h === "number" &&
		typeof c.s === "number" &&
		typeof c.l === "number"
	);
}

function isHEX(c) {
	if (typeof c !== "string" || c.length < 4 || c.charAt(0) != "#") {
		return false;
	}
	let r, g, b;
	if (c.length < 7) {
		r = parseInt(c.charAt(1) + c.charAt(1), 16);
		g = parseInt(c.charAt(2) + c.charAt(2), 16);
		b = parseInt(c.charAt(3) + c.charAt(3), 16);
	} else {
		r = parseInt(c.charAt(1) + c.charAt(2), 16);
		g = parseInt(c.charAt(3) + c.charAt(4), 16);
		b = parseInt(c.charAt(5) + c.charAt(6), 16);
	}
	return (
		typeof r === "number" && typeof g === "number" && typeof b === "number"
	);
}
//#endregion
//#endregion
//#region CONVERSION FUNCTIONS

function toRGB(color) {
	if (isRGB(color)) return {...color};
	if (isHSL(color)) return HSLToRGB(color);
	if (isHEX(color)) return HEXToRGB(color);
	return RGB();
}

function toHSL(color) {
	if (isHSL(color)) return {...color};
	if (isRGB(color)) return RGBToHSL(color);
	if (isHEX(color)) return HEXToHSL(color);
	return HSL();
}

function toHEX(color) {
	if (isHEX(color)) return color;
	if (isRGB(color)) return RGBToHEX(color);
	if (isHSL(color)) return HSLToHEX(color);
	return HEX();
}

function RGBToHSL(color) {
	if (!isColor(color)) return HSL();
	const rgb = mapColor(toRGB(color), 0, 1, true),
		cmin = Math.min(rgb.r, rgb.g, rgb.b),
		cmax = Math.max(rgb.r, rgb.g, rgb.b),
		delta = cmax - cmin;

	let hsl = HSL(0, 0, 0, color.a ? color.a : A_RANGE);

	switch (cmax) {
		case rgb.r:
			if (rgb.g - rgb.b && delta) {
				hsl.h = ((rgb.g - rgb.b) / delta) % 6;
			} else {
				hsl.h = 0;
			}
			break;
		case rgb.g:
			if (rgb.b - rgb.r && delta) {
				hsl.h = (rgb.b - rgb.r) / delta + 2;
			} else {
				hsl.h = 2;
			}
			break;
		case rgb.b:
			if (rgb.r - rgb.g && delta) {
				hsl.h = (rgb.r - rgb.g) / delta + 4;
			} else {
				hsl.h = 4;
			}
			break;
	}

	hsl.h = euclideanModulo(map(hsl.h, 0, 6, 0, 1, true), 1);
	hsl.l = cmax + cmin != 0 ? constrain((cmax + cmin) / 2, 0, 1) : 0;
	hsl.s =
		delta == 0 ? 0 : constrain(delta / (1 - Math.abs(2 * hsl.l - 1)), 0, 1);

	hsl.h = map(hsl.h, 0, 1, 0, H_RANGE);
	hsl.s = map(hsl.s, 0, 1, 0, S_RANGE);
	hsl.l = map(hsl.l, 0, 1, 0, L_RANGE);
	return hsl;
}

function RGBToHEX(color) {
	const c = toRGB(color);
	return HEX(c.r, c.g, c.b, c.a, true);
}

function HSLToRGB(color) {
	const hsl = toHSL(color);
	hsl.h = euclideanModulo(hsl.h, H_RANGE);
	hsl.s = normalize(hsl.s, 0, S_RANGE);
	hsl.l = normalize(hsl.l, 0, L_RANGE);

	// chroma / color intensity / strongest color
	const c = (1 - Math.abs(2 * hsl.l - 1)) * hsl.s;
	// second strongest color
	const x =
		hsl.h == 0 ? 0 : c * (1 - Math.abs(((hsl.h / (H_RANGE / 6)) % 2) - 1));
	// add to each channel to match lightness
	const m = hsl.l - c / 2;

	const rgb = RGB(0, 0, 0, hsl.a ? hsl.a : A_RANGE);

	const hueSegment = segmentMap(hsl.h, 6, 0, H_RANGE);
	switch (hueSegment) {
		// hue between 0 and 60
		case 0:
			rgb.r = c;
			rgb.g = x;
			rgb.b = 0;
			break;
		// hue between 60 and 120
		case 1:
			rgb.r = x;
			rgb.g = c;
			rgb.b = 0;
			break;
		// hue between 120 and 180
		case 2:
			rgb.r = 0;
			rgb.g = c;
			rgb.b = x;
			break;
		// hue between 180 and 240
		case 3:
			rgb.r = 0;
			rgb.g = x;
			rgb.b = c;
			break;
		// hue between 240 and 300
		case 4:
			rgb.r = x;
			rgb.g = 0;
			rgb.b = c;
			break;
		// hue between 300 and 360
		case 5:
			rgb.r = c;
			rgb.g = 0;
			rgb.b = x;
			break;
	}
	rgb.r = map(rgb.r + m, 0, 1, 0, RGB_RANGE, true);
	rgb.g = map(rgb.g + m, 0, 1, 0, RGB_RANGE, true);
	rgb.b = map(rgb.b + m, 0, 1, 0, RGB_RANGE, true);
	return rgb;
}

function HSLToHEX(color) {
	if (!isColor(color)) return HEX();
	return RGBToHEX(HSLToRGB(color));
}

function HEXToRGB(color) {
	const hex = toHEX(color);
	const r = parseInt(hex.charAt(1) + hex.charAt(2), 16);
	const g = parseInt(hex.charAt(3) + hex.charAt(4), 16);
	const b = parseInt(hex.charAt(5) + hex.charAt(6), 16);
	let a = A_RANGE;
	if (hex.length == 8) {
		a = parseInt(hex.charAt(7), 16);
	} else if (hex.length == 9) {
		a = parseInt(hex.charAt(7) + hex.charAt(8), 16);
	}
	return RGB(r, g, b, a, true);
}

function HEXToHSL(color) {
	if (!isColor(color)) return HSL();
	return RGBToHSL(HEXToRGB(color));
}

function colorToString(color) {
	return isHEX(color)
		? color
		: isRGB(color)
		? RGBToString(color)
		: isHSL(color)
		? HSLToString(color)
		: HEX();
}

function RGBToString(color) {
	const c = roundRGB(color);
	c.a = normalize(c.a, 0, A_RANGE);
	return c.a != 1
		? `rgba(${c.r}, ${c.g}, ${c.b}, ${c.a})`
		: `rgb(${c.r}, ${c.g}, ${c.b})`;
}

function HSLToString(color) {
	const c = roundHSL(color);
	c.a = normalize(c.a, 0, A_RANGE);
	return c.a != 1
		? `hsla(${c.h}, ${c.s}%, ${c.l}%, ${c.a})`
		: `hsl(${c.h}, ${c.s}%, ${c.l}%)`;
}

//#endregion
//#region MODIFYING FUNCTIONS
//#region 	CONSTRAIN COLOR
function constrainColor(color) {
	return isRGB(color)
		? constrainRGB(color)
		: isHSL(color)
		? constrainHSL(color)
		: isHEX(color)
		? constrainHEX(color)
		: color;
}

function constrainRGB(color) {
	const rgb = toRGB(color);
	rgb.r = constrain(rgb.r, 0, RGB_RANGE);
	rgb.g = constrain(rgb.g, 0, RGB_RANGE);
	rgb.b = constrain(rgb.b, 0, RGB_RANGE);
	if (rgb.a) {
		rgb.a = constrain(rgb.a, 0, A_RANGE);
	}
	return rgb;
}

function constrainHSL(color) {
	const hsl = toHSL(color);
	hsl.h = euclideanModulo(hsl.h, H_RANGE);
	hsl.s = constrain(hsl.s, 0, S_RANGE);
	hsl.l = constrain(hsl.l, 0, L_RANGE);
	if (hsl.a) {
		hsl.a = constrain(hsl.a, 0, A_RANGE);
	}
	return hsl;
}

function constrainHEX(color) {
	const rgb = HEXToRGB(toHEX(color));
	return RGBToHEX(rgb);
}
//#endregion
//#region 	ROUND COLOR
function roundColor(color, preserveFloat = false) {
	return isRGB(color)
		? roundRGB(color, preserveFloat)
		: isHSL(color)
		? roundHSL(color, preserveFloat)
		: isHEX(color)
		? constrainHEX(color)
		: color;
}

function roundRGB(color, preserveFloats = false) {
	const rgb = toRGB(color);
	for (const c in rgb) {
		if (typeof rgb[c] !== "number" || isInt(rgb[c])) continue;
		if (preserveFloats && RANGE[c] && RANGE[c] < 100) {
			let precision = RANGE[c] <= 1 ? 3 : RANGE[c] <= 10 ? 2 : 1;
			rgb[c] = roundFloat(rgb[c], precision);
		} else {
			rgb[c] = Math.round(rgb[c]);
		}
	}
	return rgb;
}

function roundHSL(color, preserveFloats = false) {
	const hsl = toHSL(color),
		range = RANGE;
	for (const c in hsl) {
		if (typeof hsl[c] !== "number" || isInt(hsl[c])) continue;
		if (preserveFloats && RANGE[c] && RANGE[c] < 100) {
			let precision = RANGE[c] <= 1 ? 3 : RANGE[c] <= 10 ? 2 : 1;
			hsl[c] = roundFloat(hsl[c], precision);
		} else {
			hsl[c] = Math.round(hsl[c]);
		}
	}
	return hsl;
}

//#endregion
//#region 	INVERT COLOR
function invertColor(c) {
	return isRGB(c)
		? invertRGB(c)
		: isHSL(c)
		? invertHSL(c)
		: isHEX(c)
		? invertHEX(c)
		: c;
}

function invertRGB(c) {
	if (!isRGB(c)) return c;
	return RGB(RGB_RANGE - c.r, RGB_RANGE - c.g, RGB_RANGE - c.b, true);
}

function invertHSL(c) {
	if (!isHSL(c)) return c;
	const rgb = invertRGB(HSLToRGB(c));
	return RGBToHSL(rgb);
}

function invertHEX(c) {
	if (!isHEX(c)) return c;
	const rgb = invertRGB(HEXToRGB(c));
	return RGBToHEX(rgb);
}

//#endregion

//#region 	ADD COLOR

function addColor(color1, color2) {
	if (isColor(color1)) {
		if (!isColor(color2)) return color1;
		if (isRGB(color1)) {
			return addRGB(color1, color2);
		}
		if (isHSL(color1)) {
			return addHSL(color1, color2);
		}
		if (isHEX(color1)) {
			return addHEX(color1, color2);
		}
	} else if (isColor(color2)) {
		return color2;
	}
}

function addRGB(color1, color2) {
	const c1 = toRGB(color1),
		c2 = toRGB(color2);
	c1.r += c2.r;
	c1.g += c2.g;
	c1.b += c2.b;
	return constrainRGB(c1);
}

function addHSL(color1, color2) {
	const c1 = toHSL(color1),
		c2 = toHSL(color2);
	c1.h += c2.h;
	c1.s += c2.s;
	c1.l += c2.l;
	return constrainHSL(c1);
}

function addHEX(color1, color2) {
	return RGBToHEX(addRGB(color1, color2));
}

function contrastCurve(color, strength = 0.01) {
	if (!isColor(color)) return;
	let rgb = mapColor(toRGB(color), 0, 1);
	const yMax = 3.465;
	const inc = RGB(
		cubicBezier(rgb.r, 0, -yMax, yMax, 0) * strength,
		cubicBezier(rgb.g, 0, -yMax, yMax, 0) * strength,
		cubicBezier(rgb.b, 0, -yMax, yMax, 0) * strength
	);
	for (const c in rgb) {
		if (c == "a") continue;
		rgb[c] = map(rgb[c] + inc[c], 0, 1, 0, RGB_RANGE);
	}
	return isHSL(color)
		? RGBToHSL(rgb)
		: isHEX(color)
		? RGBToHEX(color)
		: color;
}

function colorCurve(color, strength = {r: 0.01, g: 0.01, b: 0.01}) {
	if (!isColor(color)) return;
	if (!isColor(strength)) return color;
	const rgb = mapRGB(toRGB(color), 0, 1);
	const inc = RGB(
		parabola(rgb.r) * strength.r,
		parabola(rgb.g) * strength.g,
		parabola(rgb.b) * strength.b
	);
	for (const c in rgb) {
		if (c == "a") continue;
		rgb[c] = map(rgb[c] + inc[c], 0, 1, 0, RGB_RANGE);
	}
	return isHSL(color) ? RGBToHSL(rgb) : isHEX(color) ? RGBToHEX(rgb) : color;
}

function brightnessCurve(color, strength = 0.01) {
	return colorCurve(color, RGB(strength, strength, strength));
}
//#endregion
function mapColor(color, low = 0, high = 1, constrainValues = true) {
	if (!isColor(color)) return color;
	const c = isHEX(color) ? HEXToRGB(color) : {...color};
	for (const v in c) {
		if (c[v] === low) continue;
		if (c[v] && RANGE[v]) {
			c[v] = map(c[v], 0, RANGE[v], low, high, constrainValues);
		}
	}
	return c;
}

//#endregion
//#endregion
