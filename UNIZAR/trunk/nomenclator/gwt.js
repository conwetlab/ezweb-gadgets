/***************************************************************************
* Copyright 2010 (C)
Grupo de Sistemas de Información Avanzados IAAA Universidad de Zaragoza <http://iaaa.cps.unizar.es/>

This file is part of the generic nomenclator Gadget for the EzWeb Platform

nomenclator Gadget is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

nomenclator Gadget is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with nomenclator Gadget. If not, see <http://www.gnu.org/licenses/>
* ****************************************************************************/

/* The Original Code is gwt.js
 * The Initial Developer of the Original Code is IAAA.
 *
 * Created on Tue May 04 10:15:51 CEST 2010 
 */
// Copyright 2007 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License"); you may not
// use this file except in compliance with the License. You may obtain a copy of
// the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations under
// the License.
//
// This startup script is for legacy support and is now deprecated. Instead of
// using this script, just include the selection script directly.
//
(function(){
  var metas = document.getElementsByTagName("meta");
  for (var i = 0, n = metas.length; i < n; ++i) {
    var meta = metas[i], name = meta.getAttribute("name");
    if (name == "gwt:module") {
      var modName, content = meta.getAttribute("content");
      if (content) {
        var eqPos = content.lastIndexOf("=");
        if (eqPos != -1) {
          modName = content.substring(eqPos + 1);
          content = content.substring(0, eqPos) + '/' + modName;
        } else {
          modName = content;
        }
        document.write('<script src="' + content + '.nocache.js"></script>');
      }
    }
  }
})();