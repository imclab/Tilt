/*
 * TiltChromeControllers.js - Controller implementations handling events
 * version 0.1
 *
 * Copyright (c) 2011 Victor Porof
 *
 * This software is provided 'as-is', without any express or implied
 * warranty. In no event will the authors be held liable for any damages
 * arising from the use of this software.
 *
 * Permission is granted to anyone to use this software for any purpose,
 * including commercial applications, and to alter it and redistribute it
 * freely, subject to the following restrictions:
 *
 *    1. The origin of this software must not be misrepresented; you must not
 *    claim that you wrote the original software. If you use this software
 *    in a product, an acknowledgment in the product documentation would be
 *    appreciated but is not required.
 *
 *    2. Altered source versions must be plainly marked as such, and must not
 *    be misrepresented as being the original software.
 *
 *    3. This notice may not be removed or altered from any source
 *    distribution.
 */
"use strict";

var TiltChrome = TiltChrome || {};
var EXPORTED_SYMBOLS = ["TiltChrome.Controller.MouseAndKeyboard"];

/**
 * A mouse and keyboard implementation.
 */
TiltChrome.Controller = {};
TiltChrome.Controller.MouseAndKeyboard = function() {

  /**
   * Arcball used to control the visualization using the mouse.
   */
  var arcball = null,

  /**
   * Variable specifying if the controller should be paused.
   */
  paused = false,

  /**
   * Retain the position for the mouseDown event.
   */
  downX = 0, downY = 0;

  /**
   * Function called automatically by the visualization at the setup().
   * @param {HTMLCanvasElement} canvas: the canvas element
   */
  this.init = function(canvas) {
    arcball = new Tilt.Arcball(canvas.width, canvas.height);

    // bind commonly used mouse and keyboard events with the controller
    canvas.addEventListener("mousedown", mouseDown, false);
    canvas.addEventListener("mouseup", mouseUp, false);
    canvas.addEventListener("click", click, false);
    canvas.addEventListener("dblclick", doubleClick, false);
    canvas.addEventListener("mousemove", mouseMove, false);
    canvas.addEventListener("mouseout", mouseOut, false);
    canvas.addEventListener("DOMMouseScroll", mouseScroll, false);
    window.addEventListener("keydown", keyDown, false);
    window.addEventListener("keyup", keyUp, false);
  };

  /**
   * Function called automatically by the visualization each frame in draw().
   * @param {Number} frameDelta: the delta time elapsed between frames
   */
  this.loop = function(frameDelta) {
    var vis = this.visualization,
      coord = arcball.loop(frameDelta);

    // update the visualization
    vis.setRotation(coord.rotation);
    vis.setTranslation(coord.translation);
  };

  /**
   * Called once after every time a mouse button is pressed.
   */
  var mouseDown = function(e) {
    if (paused) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    downX = e.clientX - e.target.offsetLeft;
    downY = e.clientY - e.target.offsetTop;

    arcball.mouseDown(downX, downY, e.which);
  }.bind(this);

  /**
   * Called every time a mouse button is released.
   */
  var mouseUp = function(e) {
    if (paused) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    var upX = e.clientX - e.target.offsetLeft;
    var upY = e.clientY - e.target.offsetTop;

    arcball.mouseUp(upX, upY, e.which);
  }.bind(this);

  /**
   * Called every time a mouse button is clicked.
   */
  var click = function(e) {
    if (paused) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    var clickX = e.clientX - e.target.offsetLeft;
    var clickY = e.clientY - e.target.offsetTop;

    if (Math.abs(downX - clickX) < 2 && Math.abs(downY - clickY) < 2) {
      this.visualization.click(clickX, clickY);
    }
  }.bind(this);

  /**
   * Called every time a mouse button is double clicked.
   */
  var doubleClick = function(e) {
    if (paused) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    var dblClickX = e.clientX - e.target.offsetLeft;
    var dblClickY = e.clientY - e.target.offsetTop;

    if (Math.abs(downX - dblClickX) < 2 && Math.abs(downY - dblClickY) < 2) {
      this.visualization.doubleClick(dblClickX, dblClickY);
    }
  }.bind(this);

  /**
   * Called every time the mouse moves.
   */
  var mouseMove = function(e) {
    if (paused) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    var moveX = e.clientX - e.target.offsetLeft;
    var moveY = e.clientY - e.target.offsetTop;

    arcball.mouseMove(moveX, moveY);
  }.bind(this);

  /**
   * Called when the the mouse leaves the visualization bounds.
   */
  var mouseOut = function(e) {
    e.preventDefault();
    e.stopPropagation();

    arcball.mouseOut();
  }.bind(this);

  /**
   * Called when the the mouse wheel is used.
   */
  var mouseScroll = function(e) {
    e.preventDefault();
    e.stopPropagation();

    arcball.mouseScroll(e.detail);
  }.bind(this);

  /**
   * Called when a key is pressed.
   */
  var keyDown = function(e) {
    var code = e.keyCode || e.which;

    // handle key events only if the html editor is not open
    if ("open" === TiltChrome.BrowserOverlay.panel.state) {
      return;
    }

    arcball.keyDown(code);
  }.bind(this);

  /**
   * Called when a key is released.
   */
  var keyUp = function(e) {
    var code = e.keyCode || e.which;

    if (code === 27) {
      // if the panel with the html editor was open, hide it now
      if ("open" === TiltChrome.BrowserOverlay.panel.state) {
        TiltChrome.BrowserOverlay.panel.hidePopup();
      }
      else {
        TiltChrome.BrowserOverlay.destroy(true, true);
        TiltChrome.BrowserOverlay.href = null;
      }
    }

    arcball.keyUp(code);
  }.bind(this);

  /**
   * Pauses the controller from handling events.
   */
  this.pause = function() {
    paused = true;
    arcball.cancel();
  };

  /**
   * Resumes the controller to handle events.
   */
  this.unpause = function() {
    paused = false;
  };

  /**
   * Moves the camera forward or backward depending on the passed amount.
   * @param {Number} amount: the amount of zooming to do
   */
  this.zoom = function(amount) {
    arcball.zoom(amount);
  };

  /**
   * Resets the rotation and translation to origin.
   * @param {Number} factor: the reset interpolation factor between frames
   */
  this.reset = function(factor) {
    arcball.reset(factor);
  };

  /**
   * Delegate method, called when the controller needs to be resized.
   *
   * @param width: the new width of the visualization
   * @param height: the new height of the visualization
   */
  this.resize = function(width, height) {
    arcball.resize(width, height);
  };

  /**
   * Destroys this object and sets all members to null.
   * @param {HTMLCanvasElement} canvas: the canvas dom element
   */
  this.destroy = function(canvas) {
    canvas.removeEventListener("mousedown", mouseDown, false);
    canvas.removeEventListener("mouseup", mouseUp, false);
    canvas.removeEventListener("click", click, false);
    canvas.removeEventListener("dblclick", doubleClick, false);
    canvas.removeEventListener("mousemove", mouseMove, false);
    canvas.removeEventListener("mouseout", mouseOut, false);
    canvas.removeEventListener("DOMMouseScroll", mouseScroll, false);
    window.removeEventListener("keydown", keyDown, false);
    window.removeEventListener("keyup", keyUp, false);

    mouseDown = null;
    mouseUp = null;
    click = null;
    doubleClick = null;
    mouseMove = null;
    mouseOut = null;
    mouseScroll = null;
    keyDown = null;
    keyUp = null;

    Tilt.destroyObject(this);
  };
};
