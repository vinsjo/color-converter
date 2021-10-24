"use strict";
import Color from "./modules/color/Color.js";

const slider = document.querySelector(".app .input-slider");
const sliderOutput = document.querySelector(".app .slider-value");

function sliderChange() {
	sliderOutput.value = slider.value;
}
slider.onchange = sliderChange;
slider.oninput = sliderChange;
