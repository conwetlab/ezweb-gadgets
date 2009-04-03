/* JavaScript Virtual Keyboard (numpad variant), version 2.7
 *
 * Copyright (C) 2006-2008 Dmitriy Khudorozhkov (mailto:dmitrykhudorozhkov@yahoo.com)
 *
 * This software is provided "as-is", without any express or implied warranty.
 * In no event will the author be held liable for any damages arising from the
 * use of this software.
 *
 * Permission is granted to anyone to use this software for any purpose,
 * including commercial applications, and to alter it and redistribute it
 * freely, subject to the following restrictions:
 *
 * 1. The origin of this software must not be misrepresented; you must not
 *    claim that you wrote the original software. If you use this software
 *    in a product, an acknowledgment in the product documentation would be
 *    appreciated but is not required.
 *
 * 2. Altered source versions must be plainly marked as such, and must not be
 *    misrepresented as being the original software.
 *
 * 3. This notice may not be removed or altered from any source distribution.
 */

function VNumpad(container_id, callback_ref, font_size, do_embed, do_gap)
{
  return this._construct(container_id, callback_ref, font_size,
                         do_embed, do_gap);
}

VNumpad.kbArray = [];

VNumpad.prototype = {

  _setup_event: function(elem, eventType, handler)
  {
    return (elem.attachEvent ? elem.attachEvent("on" + eventType, handler) : ((elem.addEventListener) ? elem.addEventListener(eventType, handler, false) : null));
  },

  _start_flash: function(event)
  {
    var e = event || window.event;
    var in_el = e.srcElement || e.target;

    in_el.className="keybuttonpressed";
  },

  _end_flash: function(event)
  {
    var e = event || window.event;
    var in_el = e.srcElement || e.target;

    in_el.className="keybutton";
  },

  _setup_style: function(obj, top, left, width, height, position, text_align, line_height, padding_left, padding_right)
  {
    var os = obj.style;

    if(top)    os.top = top;
    if(left)   os.left = left;
    if(width)  os.width = width;
    if(height) os.height = height;

    if(position) os.position = position;

    if(text_align)  os.textAlign  = text_align;
    if(line_height) os.lineHeight = line_height;

    if(padding_left)  os.paddingLeft  = padding_left;
    if(padding_right) os.paddingRight = padding_right;
  },

  _setup_key: function(parent, id, top, left, width, height, text_align, line_height, padding_left, padding_right)
  {
    var _id = this.Cntr.id + id;
    var exists = document.getElementById(_id);

    var key = exists ? exists.parentNode : document.createElement("DIV");
    this._setup_style(key, top, left, width, height, "absolute");

    var key_sub = exists || document.createElement("DIV");
    key.appendChild(key_sub); parent.appendChild(key);

    key_sub.className = "keybutton";

    this._setup_style(key_sub, "", "", "", line_height, "relative", text_align, line_height, padding_left, padding_right);
    key_sub.id = _id;

    if(!exists){
	this._setup_event(key_sub, 'mouseup', this._end_flash);
	this._setup_event(key_sub, 'mousedown', this._start_flash);
	this._setup_event(key_sub, 'mouseout', this._end_flash);
	this._setup_event(key_sub, 'click', this._generic_callback_proc);
    }

    return key_sub;
  },

  _findX: function(obj)
  { return (obj && obj.parentNode) ? parseFloat(obj.parentNode.offsetLeft) : 0; },

  _findY: function(obj)
  { return (obj && obj.parentNode) ? parseFloat(obj.parentNode.offsetTop) : 0; },

  _findW: function(obj)
  { return (obj && obj.parentNode) ? parseFloat(obj.parentNode.offsetWidth) : 0; },

  _findH: function(obj)
  { return (obj && obj.parentNode) ? parseFloat(obj.parentNode.offsetHeight) : 0; },

  _construct: function(container_id, callback_ref, font_size, do_embed, do_gap)
  {
    var exists  = (this.Cntr != undefined), ct = exists ? this.Cntr : document.getElementById(container_id);

    this._Callback = ((typeof(callback_ref) == "function") && ((callback_ref.length == 1) || (callback_ref.length == 2))) ? callback_ref : (this._Callback || null);

    var fs = font_size || this.fontsize || "14px";
    this.gap = (do_gap != undefined) ? (do_gap ? 1 : -1) : (this.gap || 1);

    this.fontsize = fs;

    if(!exists)
    {
      this.Cntr = ct, this.LastKey = null;

      VNumpad.kbArray[container_id] = this;
    }

    var kb = exists ? ct.childNodes[0] : document.createElement("DIV");

    kb.className = "keycontainer";

    if(!exists)
    {
      ct.appendChild(kb);
      ct.style.display = "block";
      ct.style.zIndex  = 999;

      if(do_embed)
        ct.style.position = "relative";
      else
      {
        ct.style.position = "absolute";

        var initX = 0, initY = 0, ct_ = ct;
        if(ct_.offsetParent)
        {
          while (ct_.offsetParent)
          {
            initX += ct_.offsetLeft;
            initY += ct_.offsetTop;

            ct_ = ct_.offsetParent;
          }
        }
        else if (ct_.x)
        {
          initX += ct_.x;
          initY += ct_.y;
        }

        ct.style.top = initY + "px", ct.style.left = initX +"px";
      }
 
      kb.style.position = "relative";
      kb.style.top      = "0px", kb.style.left = "0px";
    }

    var kb_main = exists ? kb.childNodes[0] : document.createElement("DIV"), ks = kb_main.style;
    if(!exists)
    {
      kb.appendChild(kb_main);

	kb_main.className="numpad";

      ks.position = "relative";
      ks.width    = "1px";
      ks.cursor   = "default";
    }

    // Disable content selection:
    this._setup_event(kb_main, "selectstart", function(event) { return false; });
    this._setup_event(kb_main, "mousedown",   function(event) { if(event.preventDefault) event.preventDefault(); return false; });

    if(!exists || changed)
    {
      ks.width  = this._create_numpad(container_id, kb_main);
      ks.height = (this._findY(this.LastKey) + this._findH(this.LastKey) + this.gap) + "px";
    }

    return this;
  },

  _create_numpad: function(container_id, parent)
  {
    var c = "center", n = "normal", l = "left", gap = this.gap;
    var fs = this.fontsize;

    var mag = parseFloat(fs) / 14.0, cell = Math.floor(25.0 * mag);
    var dcell = 2 * cell, dp = (dcell + 1) + "px", dp2 = (dcell - 1 - ((gap < 0) ? 2 : 0)) + "px";
    var cp = String(cell) + "px", lh = String(Math.floor(cell - 2.0)) + "px";

    var edge = gap + "px";

    var kb_pad_eur = this._setup_key(parent, "___pad_eur", gap + "px", edge, cp, cp, c, lh);
    kb_pad_eur.innerHTML = "&#x20AC;";

    var edge_1 = (this._findX(kb_pad_eur) + this._findW(kb_pad_eur) + gap) + "px";

    var kb_pad_slash = this._setup_key(parent, "___pad_slash", gap + "px", edge_1, cp, cp, c, lh);
    kb_pad_slash.innerHTML = "/";

    var edge_2 = (this._findX(kb_pad_slash) + this._findW(kb_pad_slash) + gap) + "px";

    var kb_pad_star = this._setup_key(parent, "___pad_star", gap + "px", edge_2, cp, cp, c, lh);
    kb_pad_star.innerHTML = "*";

    var edge_3 = (this._findX(kb_pad_star) + this._findW(kb_pad_star) + gap) + "px";

    var kb_pad_minus = this._setup_key(parent, "___pad_minus", gap + "px", edge_3, cp, cp, c, lh);
    kb_pad_minus.innerHTML = "-";

    this.kbpM = this._findX(kb_pad_minus) + this._findW(kb_pad_minus) + gap;

    var prevH = this._findH(kb_pad_eur), edge_Y = (this._findY(kb_pad_eur) + prevH + gap) + "px";

    var kb_pad_7 = this._setup_key(parent, "___pad_7", edge_Y, edge, cp, cp, c, lh);
    kb_pad_7.innerHTML = "7";

    var kb_pad_8 = this._setup_key(parent, "___pad_8", edge_Y, edge_1, cp, cp, c, lh);
    kb_pad_8.innerHTML = "8";

    var kb_pad_9 = this._setup_key(parent, "___pad_9", edge_Y, edge_2, cp, cp, c, lh);
    kb_pad_9.innerHTML = "9";

    var kb_pad_plus = this._setup_key(parent, "___pad_plus", edge_Y, edge_3, cp, dp, c, dp2);
    kb_pad_plus.innerHTML = "+";

    edge_Y = (this._findY(kb_pad_7) + prevH + gap) + "px";

    var kb_pad_4 = this._setup_key(parent, "___pad_4", edge_Y, edge, cp, cp, c, lh);
    kb_pad_4.innerHTML = "4";

    var kb_pad_5 = this._setup_key(parent, "___pad_5", edge_Y, edge_1, cp, cp, c, lh);
    kb_pad_5.innerHTML = "5";

    var kb_pad_6 = this._setup_key(parent, "___pad_6", edge_Y, edge_2, cp, cp, c, lh);
    kb_pad_6.innerHTML = "6";

    edge_Y = (this._findY(kb_pad_4) + prevH + gap) + "px";

    var kb_pad_1 = this._setup_key(parent, "___pad_1", edge_Y, edge, cp, cp, c, lh);
    kb_pad_1.innerHTML = "1";

    var kb_pad_2 = this._setup_key(parent, "___pad_2", edge_Y, edge_1, cp, cp, c, lh);
    kb_pad_2.innerHTML = "2";

    var kb_pad_3 = this._setup_key(parent, "___pad_3", edge_Y, edge_2, cp, cp, c, lh);
    kb_pad_3.innerHTML = "3";

    var kb_pad_enter = this._setup_key(parent, "___pad_enter", edge_Y, edge_3, cp, dp, c, dp2);
    kb_pad_enter.innerHTML = "Enter";

    edge_Y = (this._findY(kb_pad_1) + prevH + gap) + "px";

    var kb_pad_0 = this._setup_key(parent, "___pad_0", edge_Y, edge, dp, cp, l, lh, 7 * mag + "px");
    kb_pad_0.innerHTML = "0";

    var kb_pad_period = this._setup_key(parent, "___pad_period", edge_Y, edge_2, cp, cp, c, lh);
    kb_pad_period.innerHTML = ".";

    this.LastKey = kb_pad_period;

    return String(this._findX(kb_pad_minus) + this._findW(kb_pad_minus) + gap) + "px";
  },

  _generic_callback_proc: function(event)
  {
    var e = event || window.event;
    var in_el = e.srcElement || e.target;
    var container_id = in_el.id.substring(0, in_el.id.indexOf("___"));

    var vpad = VNumpad.kbArray[container_id];

    if(vpad._Callback) vpad._Callback(in_el.innerHTML, vpad.Cntr.id);
  },

  Show: function(value)
  {
    var ct = this.Cntr.style;

    ct.display = ((value == undefined) || (value == true)) ? "block" : ((value == false) ? "none" : ct.display);
  }
};
