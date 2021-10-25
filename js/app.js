"use strict";
import Color from "./modules/color/Color.js";
import {isNum, map} from "./modules/helpers/MathUtils.js";

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

initInputs(0, 100, 50);
initOutputs();
updateAll();

function sliderDisplayObject(slider) {
	return {
		slider: slider,
		get val() {
			return parseInt(this.slider.value);
		},
		set val(val) {
			if (isNum(val)) {
				this.slider.value = val.toString();
			} else if (typeof val === "string") {
				let num = parseInt(val);
				if (isNum(num)) {
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
		set textColor(color) {
			if (typeof color === "string") {
				this.text.style.color = color;
			} else if (Color.isColor(color)) {
				this.text.style.color = Color.toString(color);
			}
		},
		updateBG() {
			const c = this.color;
			const bgColor = Color.toString(c);
			this.text.value = bgColor;
			this.box.style.backgroundColor = bgColor;
		},
	};
}

function updateAll() {
	const hsl = Color.roundHSL(
		Color.HSL(inputs.hue.val, inputs.sat.val, inputs.light.val, true)
	);
	const rgb = Color.HSLToRGB(hsl);
	const hex = Color.RGBToHEX(Color.roundRGB(rgb));
	outputs.rgb.color = rgb;
	outputs.hsl.color = hsl;
	outputs.hex.color = hex;
	const textColor = hsl.l <= 50 ? "#ffffff" : "#000000";
	for (const i in outputs) {
		outputs[i].textColor = textColor;
	}
}

function initInputs(h = 0, s = 100, l = 50) {
	inputs.hue.slider.max = Color.H_RANGE;
	inputs.sat.slider.max = Color.S_RANGE;
	inputs.light.slider.max = Color.L_RANGE;
	inputs.hue.val = isNum(h) ? h : 0;
	inputs.sat.val = isNum(s) ? s : 0;
	inputs.light.val = isNum(l) ? l : 0;
	for (const i in inputs) {
		inputs[i].slider.min = 0;
		inputs[i].slider.onchange = updateAll;
		inputs[i].slider.oninput = updateAll;
	}
}

function initOutputs() {
	for (const i in outputs) {
		outputs[i].box.onclick = () => {
			outputs[i].text.select();
			outputs[i].text.setSelectionRange(0, 99999);
			navigator.clipboard.writeText(outputs[i].text.value);
			console.log("Copied: " + outputs[i].text.value);
		};
	}
}
