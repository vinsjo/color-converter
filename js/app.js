"use strict";
import Color from "./modules/color/Color.js";
import ImageApp from "./modules/ImageApp.js";
import {map} from "./modules/helpers/MathUtils.js";

const app = new ImageApp(document.querySelector(".app"));
app.addToDOM();

const c = new Color(200, 128, 0);
const refreshRate = -1;
const maxFrames = 0;
let frameCount = 0;

updateBgColor();

function bgSpectrum(color, spectrumWidth = 1) {
	const cln = color.clone();
	app.ctx.lineWidth = 2;
	for (let x = 0; x <= app.canvas.width; x++) {
		shiftHue(cln, (360 * spectrumWidth) / app.canvas.width);

		app.ctx.strokeStyle = cln.toString();
		app.ctx.beginPath();
		app.ctx.moveTo(x, 0);
		app.ctx.lineTo(x, app.canvas.height);
		app.ctx.stroke();
	}
}

function shiftHue(color, shift) {
	color.add(Color.HSL(shift, 0, 0));
}
function updateBgColor() {
	app.fill(c.toString());
}
function animate() {
	frameCount++;
	if (maxFrames && frameCount >= maxFrames) {
		return;
	}
	const rgb = c.RGB;

	if (frameCount % 5 == 0) {
		//console.log("rgb", rgb);
		console.log(Color.toString(c.HSL));
	}
	shiftHue(c, 5);
	bgSpectrum(c, 50);

	if (refreshRate) {
		if (refreshRate > 0) {
			setTimeout(() => {
				requestAnimationFrame(animate);
			}, 1000 / refreshRate);
		} else {
			requestAnimationFrame(animate);
		}
	}
}

animate();
