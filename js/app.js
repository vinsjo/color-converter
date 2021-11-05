"use strict";
import Color from "./modules/Color.js";
import {constrain} from "./modules/MathUtils.js";
import {containDocumentBody} from "./modules/Utils.js";

const outputs = {
	rgb: colorOutputObject(
		document.querySelector(".color-output.rgb"),
		document.querySelector(".color-text.rgb")
	),
	hsl: colorOutputObject(
		document.querySelector(".color-output.hsl"),
		document.querySelector(".color-text.hsl")
	),
	hex: colorOutputObject(
		document.querySelector(".color-output.hex"),
		document.querySelector(".color-text.hex")
	),
};

const inputs = {
	hue: sliderDisplayObject(document.querySelector(".input-slider.hue")),
	sat: sliderDisplayObject(document.querySelector(".input-slider.sat")),
	light: sliderDisplayObject(document.querySelector(".input-slider.light")),
};

const initC = Color.toHSL(Color.randomRGB());

window.onload = () => {
	containDocumentBody();
	window.onresize = () => {
		containDocumentBody();
	};
	initInputs(initC.h, initC.s, initC.l);
	initOutputs();
	updateAll();
	document.querySelector(".app").classList.add("show");
};

function sliderDisplayObject(slider) {
	return {
		slider: slider,
		get val() {
			return parseInt(this.slider.value);
		},
		set val(val) {
			if (typeof val === "number") {
				this.slider.value = val.toString();
			} else if (typeof val === "string") {
				let num = parseInt(val);
				if (typeof num === "number") {
					this.slider.value = num.toString();
				}
			}
		},
	};
}

function colorOutputObject(colorBox, colorText) {
	return {
		box: colorBox,
		text: colorText,
		_color: Color.RGB(0, 0, 0),
		get color() {
			return this._color;
		},
		set color(c) {
			if (!Color.isColor(c)) return;
			this._color = c;
			this.updateBG();
		},
		get textColor() {
			return this.text.style.color;
		},
		set textColor(c) {
			if (!Color.isColor(c)) return;
			this.text.style.color = Color.toString(c);
		},
		updateBG() {
			const bgColor = Color.toString(this.color);
			this.text.value = bgColor;
			this.box.style.backgroundColor = bgColor;
		},
	};
}

function updateAll() {
	const hsl = Color.roundHSL(
		Color.HSL(
			parseInt(inputs.hue.val),
			parseInt(inputs.sat.val),
			parseInt(inputs.light.val),
			true
		)
	);
	const rgb = Color.HSLToRGB(hsl);
	const hex = Color.RGBToHEX(Color.roundRGB(rgb));
	document.body.style.backgroundColor = hex;
	outputs.rgb.color = rgb;
	outputs.hsl.color = hsl;
	outputs.hex.color = hex;
	const textColor = hsl.l <= 50 ? "#ffffff" : "#000000";
	for (const i in outputs) {
		outputs[i].textColor = textColor;
	}
}

function initInputs(h = 0, s = 100, l = 50) {
	const range = Color.RANGE;
	inputs.hue.slider.max = range.h;
	inputs.sat.slider.max = range.s;
	inputs.light.slider.max = range.l;
	inputs.hue.val = constrain(h, 0, range.h);
	inputs.sat.val = constrain(s, 0, range.s);
	inputs.light.val = constrain(l, 0, range.l);
	for (const i in inputs) {
		inputs[i].slider.min = 0;
		inputs[i].slider.onchange = updateAll;
		inputs[i].slider.oninput = updateAll;
	}
}

function initOutputs() {
	for (const i in outputs) {
		outputs[i].box.onclick = () => {
			const v = outputs[i].text.value;
			outputs[i].text.select();
			outputs[i].text.setSelectionRange(0, 99999);
			navigator.clipboard.writeText(v);
			outputs[i].text.value = "Copied!";
			setTimeout(() => {
				outputs[i].text.value = v;
			}, 1000);
			console.log("Copied: " + v);
		};
	}
}
