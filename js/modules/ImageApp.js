"use strict";
/**
 * @module ImageApp
 * @requires Utils
 * @requires MathUtils
 * @requires Colors
 */

import {
	clearChildNodes,
	isHtmlElement,
	isVoidElement,
} from "./helpers/Utils.js";
import Color from "./color/Color.js";

export default class ImageApp {
	constructor(appContainer) {
		this.initContainer(appContainer);
	}

	/**
	 * @returns {HTMLElement}
	 */
	get container() {
		return this._container;
	}
	/**
	 * @returns {HTMLDivElement}
	 */
	get canvasContainer() {
		return this._canvasContainer;
	}
	/**
	 * @returns {HTMLCanvasElement}
	 */
	get canvas() {
		return this._canvas;
	}
	/**
	 * @returns {CanvasRenderingContext2D}
	 */
	get ctx() {
		return this._ctx;
	}

	get data() {
		return this._data;
	}

	get background() {
		return this._backgroundColor;
	}

	set background(color) {
		if (typeof color === "string") {
			this._backgroundColor = color;
		}
	}

	initContainer(htmlElement) {
		if (
			isHtmlElement(htmlElement) &&
			!isVoidElement(htmlElement) &&
			this._container !== htmlElement
		) {
			this._container = htmlElement;
		} else if (!this._container) {
			this._container = document.createElement("div");
			this._container.className = "app";
		}
	}

	initCanvasContainer() {
		this._canvasContainer = document.createElement("div");
		this._canvasContainer.className = "canvas-container";
	}

	initCanvas() {
		this._canvas = document.createElement("canvas");
		this._canvas.id = "app-canvas";
		this.initCtx();
	}

	initCtx(context) {
		if (
			context instanceof CanvasRenderingContext2D &&
			context.canvas === this.canvas &&
			context !== this._ctx
		) {
			this._ctx = context;
		} else if (!this._ctx && this.canvas) {
			this._ctx = this.canvas.getContext("2d");
		}
	}

	addToDOM() {
		if (!this.container) {
			this.initContainer();
		}
		if (!this.container.isConnected) {
			document.body.appendChild(this._container);
		}
		const app = this.container;
		if (this.childCount > 0) {
			clearChildNodes(app);
		}
		if (!this.canvasContainer) {
			this.initCanvasContainer();
		}
		if (!this.canvas) {
			this.initCanvas();
		}
		app.appendChild(this.canvasContainer);
		this.canvasContainer.appendChild(this.canvas);
		this.updateCanvasSize();
	}

	updateCanvasSize(preserveContent = false) {
		if (!this.canvas || !this.canvasContainer) return;
		const rect = this.canvasContainer.getBoundingClientRect();
		if (
			rect.width === this.canvas.width &&
			rect.height === this.canvas.height
		) {
			return;
		}
		this.canvas.width = rect.width;
		this.canvas.height = rect.height;
	}

	storeImageData() {
		if (!this.canvas || !this.ctx) return;
		this._data = this.ctx.getImageData(
			0,
			0,
			this.canvas.width,
			this.canvas.height
		);
	}

	fill(color) {
		if (typeof color !== "string" || !this.canvas || !this.ctx) return;
		const fs = this.ctx.fillStyle;
		this.ctx.fillStyle = color;
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
		this.ctx.fillStyle = fs;
	}
}
