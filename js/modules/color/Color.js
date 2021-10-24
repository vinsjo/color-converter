"use strict";
/**
 * @module Color
 * @requires MathUtils
 * @requires Utils
 * @requires ColorTypes
 */
import {
	isNum,
	roundFloat,
	constrain,
	normalize,
	map,
	segmentMap,
	euclideanModulo,
	parabola,
	cubicBezier,
	isInt,
} from "../helpers/MathUtils.js";

//Based on Color class in three.js: https://github.com/mrdoob/three.js/blob/master/src/math/Color.js
export default class Color {
	//#region STATIC PROPERTIES
	static #RGB_RANGE = 255;
	static #HUE_RANGE = 360;
	static #SATURATION_RANGE = 100;
	static #LIGHTNESS_RANGE = 100;
	static #ALPHA_RANGE = 1;
	//#endregion

	//#region STATIC GETTERS

	static get RGB_RANGE() {
		return this.#RGB_RANGE;
	}
	static get A_RANGE() {
		return this.#ALPHA_RANGE;
	}
	static get H_RANGE() {
		return this.#HUE_RANGE;
	}
	static get S_RANGE() {
		return this.#SATURATION_RANGE;
	}
	static get L_RANGE() {
		return this.#LIGHTNESS_RANGE;
	}

	static get RANGE() {
		return {
			rgb: this.#RGB_RANGE,
			h: this.#HUE_RANGE,
			s: this.#SATURATION_RANGE,
			l: this.#LIGHTNESS_RANGE,
			a: this.#ALPHA_RANGE,
		};
	}

	//#endregion

	//#region STATIC VALIDATORS
	static validColorRange(range, throwOnInvalid = false) {
		let e = !isNum(range)
			? `${range} (${typeof range}) is not a Number.`
			: !isInt(range)
			? `${range} is not an integer.`
			: range <= 0
			? `Range can not be less than or equal to zero.`
			: false;
		if (e) {
			if (throwOnInvalid) {
				throw e;
			}
			return false;
		}
		return true;
	}
	static isRGB(c) {
		return (
			typeof c === "object" &&
			c.hasOwnProperty("r") &&
			c.hasOwnProperty("g") &&
			c.hasOwnProperty("b") &&
			isNum(c.r) &&
			isNum(c.g) &&
			isNum(c.b)
		);
	}

	static isHSL(c) {
		return (
			typeof c === "object" &&
			c.hasOwnProperty("h") &&
			c.hasOwnProperty("s") &&
			c.hasOwnProperty("l") &&
			isNum(c.h) &&
			isNum(c.s) &&
			isNum(c.l)
		);
	}

	static isColor(c) {
		return this.isRGB(c) || this.isHSL(c);
	}
	//#endregion

	//#region STATIC OBJECT BUILDERS
	static RGB(r, g, b, a, constrainValues = false) {
		const rgb = {r: 0, g: 0, b: 0, a: isNum(a) ? a : this.A_RANGE};
		if (isNum(r) && !isNum(g) && !isNum(b)) {
			rgb.r = rgb.g = rgb.b = r;
		} else {
			isNum(r) && (rgb.r = r);
			isNum(g) && (rgb.g = g);
			isNum(b) && (rgb.b = b);
		}
		return constrainValues ? this.constrainRGB(rgb) : rgb;
	}

	static HSL(h, s, l, a, constrainValues = false) {
		const hsl = {
			h: isNum(h) ? h : 0,
			s: isNum(s) ? s : 0,
			l: isNum(l) ? l : 0,
			a: isNum(a) ? a : this.A_RANGE,
		};
		return constrainValues ? this.constrainHSL(hsl) : hsl;
	}

	static constrainRGB(color) {
		if (!this.isRGB(color)) return color;
		const rgb = {...color},
			range = this.RANGE;
		rgb.r = constrain(rgb.r, 0, range.rgb);
		rgb.g = constrain(rgb.g, 0, range.rgb);
		rgb.b = constrain(rgb.b, 0, range.rgb);
		if (rgb.a) {
			rgb.a = constrain(rgb.a, 0, range.a);
		}
		return rgb;
	}
	static constrainHSL(color) {
		if (!this.isHSL(color)) return color;
		const hsl = {...color},
			range = this.RANGE;
		hsl.h = euclideanModulo(hsl.h, range.h);
		hsl.s = constrain(hsl.s, range.s);
		hsl.l = constrain(hsl.l, range.l);
		if (hsl.a) {
			hsl.a = constrain(hsl.a, 0, range.a);
		}
		return hsl;
	}
	//#endregion

	//#region STATIC CONVERSION METHODS

	static RGBToHSL(color) {
		if (!this.isRGB(color)) return this.HSL();
		const rgb = this.normalizeColor(color),
			range = this.RANGE,
			cmin = Math.min(rgb.r, rgb.g, rgb.b),
			cmax = Math.max(rgb.r, rgb.g, rgb.b),
			delta = cmax - cmin;

		let hsl = this.HSL(0, 0, 0, color.a ? color.a : range.a);

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

		hsl.h = euclideanModulo(map(hsl.h, 0, 6, 0, 1), 1);
		hsl.l = constrain((cmax + cmin) / 2, 0, 1);
		hsl.s =
			delta == 0
				? 0
				: constrain(delta / (1 - Math.abs(2 * hsl.l - 1)), 0, 1);

		hsl.h = map(hsl.h, 0, 1, 0, range.h);
		hsl.s = map(hsl.s, 0, 1, 0, range.s);
		hsl.l = map(hsl.l, 0, 1, 0, range.l);
		return hsl;
	}

	static HSLToRGB(color) {
		if (!this.isHSL(color)) return this.RGB();
		const range = this.RANGE;
		const hsl = {...color};
		hsl.h = euclideanModulo(hsl.h, range.h);
		hsl.s = normalize(hsl.s, 0, range.s);
		hsl.l = normalize(hsl.l, 0, range.l);

		// chroma / color intensity / strongest color
		const c = (1 - Math.abs(2 * hsl.l - 1)) * hsl.s;
		// second strongest color
		const x =
			hsl.h == 0
				? 0
				: c * (1 - Math.abs(((hsl.h / (range.h / 6)) % 2) - 1));
		// add to each channel to match lightness
		const m = hsl.l - c / 2;

		const rgb = this.RGB(0, 0, 0, hsl.a ? hsl.a : range.a);

		const hueSegment = segmentMap(hsl.h, 6, 0, range.h);
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
		rgb.r = map(rgb.r + m, 0, 1, 0, range.rgb, true);
		rgb.g = map(rgb.g + m, 0, 1, 0, range.rgb, true);
		rgb.b = map(rgb.b + m, 0, 1, 0, range.rgb, true);
		return rgb;
	}

	static toString(color) {
		if (!this.isColor(color)) return color;
		if (this.isHSL(color)) {
			const c = this.roundHSL(color);
			if (c.a != 1) {
				return `hsla(${c.h},${c.s},${c.l},${c.a})`;
			}
			return `hsl(${c.h},${c.s},${c.l})`;
		}
		const c = this.roundRGB(color);
		if (color.a != 1) {
			return `rgba(${c.r},${c.g},${c.b},${c.a})`;
		}
		return `rgb(${c.r},${c.g},${c.b})`;
	}

	//#region STATIC MODIFYING METHODS

	static roundHSL(color, hRange, sRange, lRange, aRange) {
		if (!this.isHSL(color)) return color;
		const hsl = {...color},
			range = this.RANGE,
			precision = this.HSL(
				hRange ? hRange : range.h,
				sRange ? sRange : range.s,
				lRange ? lRange : range.l,
				aRange ? aRange : range.a
			);
		for (const c in precision) {
			if (isNum(hsl[c]) && !isInt(hsl[c])) {
				precision[c] =
					precision[c] >= 255
						? 0
						: precision[c] / 100 >= 1
						? 1
						: precision[c] / 10 >= 1
						? 2
						: 3;
				hsl[c] = roundFloat(hsl[c], precision[c]);
			}
		}
		return hsl;
	}

	static roundRGB(color, rgbRange, aRange) {
		if (!this.isRGB(color)) return color;
		const rgb = {...color},
			range = this.RANGE;
		rgbRange && isNum(rgbRange) && (range.rgb = rgbRange);
		aRange && isNum(aRange) && (range.a = aRange);
		const precision = this.RGB(range.rgb, range.rgb, range.rgb, range.a);
		for (const c in precision) {
			if (isNum(rgb[c]) && !isInt(rgb[c])) {
				precision[c] =
					precision[c] >= 255
						? 0
						: precision[c] / 100 >= 1
						? 1
						: precision[c] / 10 >= 1
						? 2
						: 3;
				rgb[c] = roundFloat(rgb[c], precision[c]);
			}
		}
		return rgb;
	}

	static normalizeColor(color) {
		if (!this.isColor(color)) return color;
		const c = {...color},
			range = this.RANGE;
		if (this.isHSL(c)) {
			c.h = normalize(c.h, 0, range.h);
			c.s = normalize(c.s, 0, range.s);
			c.l = normalize(c.l, 0, range.l);
		} else if (this.isRGB(c)) {
			c.r = normalize(c.r, 0, range.rgb);
			c.g = normalize(c.g, 0, range.rgb);
			c.b = normalize(c.b, 0, range.rgb);
		}
		if (c.a) {
			c.a = normalize(c.a, 0, range.a);
		}
		return c;
	}

	//#endregion

	//#endregion

	//#region PROPERTIES
	#r = 0;
	#g = 0;
	#b = 0;
	#a = 1;
	//#endregion

	//#region CONSTRUCTOR
	/**
	 * Class constructor
	 *
	 * @method constructor
	 * @param  {Number} r  red value between 0 and 255, default is 0
	 * @param  {Number} g  green value between 0 and 255, default is 0
	 * @param  {Number} b  blue value between 0 and 255, default is 0
	 * @param  {Number} a  alpha value between 0 and 1, default is 1
	 * @return {Color}     returns new Color object
	 */
	constructor(r, g, b, a = 1) {
		this.r = isNum(r) ? r : 0;
		this.g = isNum(g) ? g : this.r;
		this.b = isNum(b) ? b : this.r;
		this.a = a;
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
		return Color.RGB(this.#r, this.#g, this.#b, this.#a);
	}

	get HSL() {
		return Color.RGBToHSL(this.RGB);
	}
	//#endregion

	//#region SETTERS
	set r(r) {
		if (isNum(r) && this.#r != r) {
			this.#r = constrain(r, 0, Color.RGB_RANGE);
		}
	}
	set g(g) {
		if (isNum(g) && this.#g != g) {
			this.#g = constrain(g, 0, Color.RGB_RANGE);
		}
	}
	set b(b) {
		if (isNum(b) && this.#b != b) {
			this.#b = constrain(b, 0, Color.RGB_RANGE);
		}
	}
	set a(a) {
		if (isNum(a) && this.#a != a) {
			this.#a = constrain(a, 0, Color.A_RANGE);
		}
	}

	set RGB(c) {
		if (!Color.isRGB(c)) return;
		this.r = c.r;
		this.g = c.g;
		this.b = c.b;
		this.a = c.a;
	}

	set HSL(c) {
		if (!Color.isHSL(c)) return;
		const rgb = Color.HSLToRGB(c);
		this.RGB = rgb;
	}

	set(c) {
		if (Color.isHSL(c)) {
			this.HSL = c;
		} else if (Color.isRGB(c)) {
			this.RGB = c;
		} else if (Array.isArray(c) && c.length > 0) {
			const rgb = Color.RGB(c[0], c[1], c[2], c[4]);
			this.RGB = rgb;
		} else if (isNum(c)) {
			const rgb = Color.RGB(c, c, c);
			this.RGB = rgb;
		}
	}
	//#endregion

	//#region MODIFYING METHODS

	invert() {
		const range = Color.RANGE;
		const rgb = Color.RGB(
			range.rgb - this.#r,
			range.rgb - this.#g,
			range.rgb - this.#b
		);
		this.RGB = rgb;
	}

	add(c) {
		if (!c) return;
		const range = Color.RANGE;
		if (Color.isRGB(c)) {
			const rgb = Color.RGB(
				c.r ? this.#r + c.r : this.#r,
				c.g ? this.#g + c.g : this.#g,
				c.b ? this.#b + c.b : this.#b
			);
			this.RGB = rgb;
		} else if (Color.isHSL(c)) {
			const hsl = this.HSL;
			c.h && (hsl.h += c.h);
			c.s && (hsl.s += c.s);
			c.l && (hsl.l += c.l);
			this.HSL = hsl;
		} else if (isNum(c)) {
			const rgb = Color.RGB(c + this.#r, c + this.#g, c + this.#b);
			this.RGB = rgb;
		}
	}

	sub(c) {
		if (!c) return;
		if (Color.isRGB(c)) {
			const rgb = Color.RGB(
				c.r ? this.#r - c.r : this.#r,
				c.g ? this.#g - c.g : this.#g,
				c.b ? this.#b - c.b : this.#b
			);
			this.RGB = rgb;
		} else if (isNum(c)) {
			const rgb = Color.RGB(this.#r - c, this.#g - c, this.#b - c);
			this.RGB = rgb;
		}
	}

	multiply(c) {
		if (!c) return;
		if (Color.isRGB(c)) {
			const rgb = Color.RGB(this.#r * c.r, this.#g * c.g, this.#b * c.b);
			this.RGB = rgb;
		} else if (isNum(c)) {
			const rgb = Color.RGB(this.#r * c, this.#g * c, this.#b * c);
			this.RGB = rgb;
		}
	}

	contrastCurve(strength = 0.01) {
		const rgb = Color.normalizeColor(this.RGB);
		const yMax = 3.465;
		const inc = Color.RGB(
			cubicBezier(rgb.r, 0, -yMax, yMax, 0) * strength,
			cubicBezier(rgb.g, 0, -yMax, yMax, 0) * strength,
			cubicBezier(rgb.b, 0, -yMax, yMax, 0) * strength
		);
		const range = Color.RGB_RANGE;
		this.r = map(rgb.r + inc.r, 0, 1, 0, range);
		this.g = map(rgb.g + inc.g, 0, 1, 0, range);
		this.b = map(rgb.b, +inc.b, 0, 1, 0, range);
	}

	colorCurve(r, g, b) {
		const strength = Color.RGB(r, g, b);
		const rgb = Color.normalize(this.RGB);
		const inc = Color.RGB(
			parabola(rgb.r) * strength.r,
			parabola(rgb.g) * strength.g,
			parabola(rgb.b) * strength.b
		);
		const range = Color.RGB_RANGE;
		this.r = map(rgb.r + inc.r, 0, 1, 0, range);
		this.g = map(rgb.g + inc.g, 0, 1, 0, range);
		this.b = map(rgb.b, +inc.b, 0, 1, 0, range);
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

	//#region MAGIC METHODS

	toString() {
		return Color.toString(Color.roundRGB(this.RGB));
	}

	//#endregion
}
