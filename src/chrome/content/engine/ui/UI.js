/***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Tilt: A WebGL-based 3D visualization of a webpage.
 *
 * The Initial Developer of the Original Code is Victor Porof.
 * Portions created by the Initial Developer are Copyright (C) 2011
 * the Initial Developer. All Rights Reserved.
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the LGPL or the GPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 ***** END LICENSE BLOCK *****/
"use strict";

var Tilt = Tilt || {};
var EXPORTED_SYMBOLS = ["Tilt.UI"];

/**
 * The top level UI handling events and containing all the views.
 */
Tilt.UI = [];
Tilt.UI.mouseX = 0;
Tilt.UI.mouseY = 0;
Tilt.UI.pmouseX = 0;
Tilt.UI.pmouseY = 0;
Tilt.UI.mousePressed = false;
Tilt.UI.mouseScrollAmmount = 0;
Tilt.UI.keyPressed = [];

/**
 * Updates and draws each view handled by the UI.
 * @param {Number} frameDelta: the delta time elapsed between frames
 */
Tilt.UI.refresh = function(frameDelta) {
  var tilt = Tilt.$renderer,
    i, len, view;

  tilt.ortho();
  tilt.defaults();
  tilt.depthTest(false);

  for (i = 0, len = this.length; i < len; i++) {
    view = this[i];

    if (!view.hidden) {
      view.update(frameDelta, tilt);
      view.draw(frameDelta, tilt);
    }
  }

  this.pmouseX = this.mouseX;
  this.pmouseY = this.mouseY;
};

/**
 * Sets a modal view.
 * @param {Tilt.View} view: the view to be set modal
 */
Tilt.UI.setModal = function(view) {
  if (view.modal || this.indexOf(view) === -1) {
    return;
  }

  for (var i = 0, len = this.length; i < len; i++) {
    this[i].$prevDisabled = this[i].disabled;
    this[i].disabled = true;
  }

  view.modal = true;
  view.hidden = false;
  view.disabled = false;
};

/**
 * Unsets a modal view.
 * @param {Tilt.View} view: the view to be set modal
 */
Tilt.UI.unsetModal = function(view) {
  if (!view.modal || this.indexOf(view) === -1) {
    return;
  }

  for (var i = 0, len = this.length; i < len; i++) {
    this[i].disabled = this[i].$prevDisabled;
    delete this[i].$prevDis;
  }

  view.modal = false;
  view.hidden = true;
  view.disabled = true;
};

/**
 * Delegate mouse down method.
 *
 * @param {Number} x: the current horizontal coordinate of the mouse
 * @param {Number} y: the current vertical coordinate of the mouse
 * @param {Number} button: which mouse button was pressed
 */
Tilt.UI.mouseDown = function(x, y, button) {
  this.mousePressed = true;
  this.mouseOver = false;
  this.$handleMouseEvent("onmousedown", x, y, button);
};

/**
 * Delegate mouse up method.
 *
 * @param {Number} x: the current horizontal coordinate of the mouse
 * @param {Number} y: the current vertical coordinate of the mouse
 * @param {Number} button: which mouse button was released
 */
Tilt.UI.mouseUp = function(x, y, button) {
  this.mousePressed = false;
  this.mouseOver = false;
  this.$handleMouseEvent("onmouseup", x, y, button);
};

/**
 * Delegate click method.
 *
 * @param {Number} x: the current horizontal coordinate of the mouse
 * @param {Number} y: the current vertical coordinate of the mouse
 */
Tilt.UI.click = function(x, y) {
  this.$handleMouseEvent("onclick", x, y);
};

/**
 * Delegate double click method.
 *
 * @param {Number} x: the current horizontal coordinate of the mouse
 * @param {Number} y: the current vertical coordinate of the mouse
 */
Tilt.UI.doubleClick = function(x, y) {
  this.$handleMouseEvent("ondoubleclick", x, y);
};

/**
 * Delegate mouse move method.
 *
 * @param {Number} x: the current horizontal coordinate of the mouse
 * @param {Number} y: the current vertical coordinate of the mouse
 */
Tilt.UI.mouseMove = function(x, y) {
  this.mouseX = x;
  this.mouseY = y;
};

/**
 * Delegate mouse scroll method.
 * @param {Number} scroll: the mouse wheel direction and speed
 */
Tilt.UI.mouseScroll = function(scroll) {
  this.mouseScrollAmmount = scroll;
  this.$handleKeyEvent("onmousescroll", scroll);
};

/**
 * Delegate mouse over method.
 */
Tilt.UI.mouseOver = function() {
};

/**
 * Delegate mouse out method.
 */
Tilt.UI.mouseOut = function() {
};

/**
 * Delegate key down method.
 * @param {Number} code: the code for the currently pressed key
 */
Tilt.UI.keyDown = function(code) {
  this.keyPressed[code] = true;
  this.$handleKeyEvent("onkeydown", code);
};

/**
 * Delegate key up method.
 * @param {Number} code: the code for the currently released key
 */
Tilt.UI.keyUp = function(code) {
  this.keyPressed[code] = false;
  this.$handleKeyEvent("onkeyup", code);
};

/**
 * Internal function, handling a mouse event for each element in a view.
 * @param {String} name: the event name
 */
Tilt.UI.$handleMouseEvent = function(name, x, y, button) {
  var i, e, len, len2, elements, element, func,
    bounds, boundsX, boundsY, boundsWidth, boundsHeight,
    mouseX = this.mouseX,
    mouseY = this.mouseY;

  for (i = 0, len = this.length; i < len; i++) {
    elements = this[i];

    if (elements.hidden || elements.disabled) {
      continue;
    }

    for (e = 0, len2 = elements.length; e < len2; e++) {
      element = elements[e];

      if (element.hidden || element.disabled) {
        continue;
      }

      bounds = element.$bounds || [-1, -1, -1, -1];
      boundsX = bounds[0];
      boundsY = bounds[1];
      boundsWidth = bounds[2];
      boundsHeight = bounds[3];

      if ("onmouseup" === name) {
        element.mousePressed = false;
      }

      if (mouseX > boundsX && mouseX < boundsX + boundsWidth &&
          mouseY > boundsY && mouseY < boundsY + boundsHeight) {

        func = element[name];

        if ("function" === typeof func) {
          func(x, y, button);
        }

        if ("onmousedown" === name) {
          element.mousePressed = true;
        }

        this.mouseOver = true;
      }
    }
  }
};

/**
 * Internal function, handling a key event for each element in a view.
 * @param {String} name: the event name
 */
Tilt.UI.$handleKeyEvent = function(name, code) {
  var i, e, len, len2, elements, element, func;

  for (i = 0, len = this.length; i < len; i++) {
    elements = this[i];

    if (elements.hidden || elements.disabled) {
      continue;
    }

    for (e = 0, len2 = elements.length; e < len2; e++) {
      element = elements[e];

      if (element.hidden || element.disabled) {
        continue;
      }

      func = element[name];

      if ("function" === typeof func) {
        func(code);
      }
    }
  }
};

// intercept this object using a profiler when building in debug mode
Tilt.Profiler.intercept("Tilt.UI", Tilt.UI);
