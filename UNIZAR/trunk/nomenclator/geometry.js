/***************************************************************************
* Copyright 2010 (C)
Grupo de Sistemas de InformaciÃ³n Avanzados IAAA Universidad de Zaragoza <http://iaaa.cps.unizar.es/>

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

/* The Original Code is geometry.js
 * The Initial Developer of the Original Code is IAAA.
 *
 * Created on Tue May 04 10:15:51 CEST 2010 
 */
////////////////////////////////////////////////////////////
// Fichero: geometry.js
// Paquete: commonTools/geometry
// Fecha creación: 
// Fecha última modificación: 07-11-2003
// Autor: David Portolés Rodríguez (dporto)
// Versión: 1.0.8
// Descripción: Contiene las clases Geometry... y java.awt.geom.*
////////////////////////////////////////////////////////////
// Modificado: 10-07-2007
// Autor: silvialm 
// Versión: 2.2.2
// Descripción: Nuevo metodo intersects en Rectangle2D_Double
////////////////////////////////////////////////////////////
// Modificado: 11-07-2007
// Autor: silvialm 
// Versión: 2.2.2
// Descripción: Nuevo metodo toPolygon,containsBbox en Rectangle2D_Double, nuevo metodo segmentsIntersect en Line y 
// nuevos metodos contains, intersects y transformSrs en Polygon
////////////////////////////////////////////////////////////


function Geometry(srs) { 
	// INTERFAZ: getBounds():Rectangle2D_Double
	this.srs = srs || "EPSG:4326";

	this.getSrs = getSrs;
	this.setSrs = setSrs;

	function getSrs() {
		return this.srs;
	}

	function setSrs(newSrs) {
		this.srs = newSrs;
	}
}
Geometry.POINT = 0;
Geometry.LINE_STRING = 1;
Geometry.LINEAR_RING = 2;
Geometry.POLYGON = 3;

function Point2D_Double(x,y) {
	this.x = x || 0;
	this.y = y || 0;

	this.getX = getX;
	this.setX = setX;
	this.getY = getY;
	this.setY = setY;
	this.setLocation = setLocation;

	function getX() {
		return this.x;
	}

	function setX(newX) {
		this.x = newX;
	}

	function getY() {
		return this.y;
	}

	function setY(newY) {
		this.y = newY;
	}

	function setLocation(newX, newY) {
		this.setX(newX);
		this.setY(newY);
	}
}
Point2D_Double.prototype = new Geometry;

function Rectangle2D_Double(x, y, width, height) {
	this.x = x || 0;
	this.y = y || 0;
	this.width = width || 0;
	this.height = height || 0;

	this.getX = getX;
	this.setX = setX;
	this.getY = getY;
	this.setY = setY;
	this.getWidth = getWidth;
	this.setWidth = setWidth;
	this.getHeight = getHeight;
	this.setHeight = setHeight;
	
	this.setRect = setRect;
	this.isEmpty = isEmpty;
	this.contains = contains;
	this.getBounds = getBounds;
	this.containsBbox = containsBbox;
	this.toPolygon = toPolygon;

	function getX() {
		return this.x;
	}

	function setX(newX) {
		this.x = newX;
	}

	function getY() {
		return this.y;
	}

	function setY(newY) {
		this.y = newY;
	}

	function getWidth() {
		return this.width;
	}

	function setWidth(newWidth) {
		this.width = newWidth;
	}

	function getHeight() {
		return this.height;
	}

	function setHeight(newHeight) {
		this.height = newHeight;
	}

	function setRect(newX, newY, newWidth, newHeight) {
		this.setX(newX);
		this.setY(newY);
		this.setWidth(newWidth);
		this.setHeight(newHeight);
	}

	function isEmpty() {
		return (this.width <= 0.0) || (this.height <= 0.0);
	}

	function contains(x, y) {		
		x0 = this.getX();
		y0 = this.getY();
		return (x >= x0 &&
			y >= y0 &&
			x < x0 + this.getWidth() &&
			y < y0 + this.getHeight());
	}
	
	function getBounds() {
		if ((this._bounds == null) ||(this._bounds.x != this.x)||(this._bounds.y != this.y)||(this._bounds.width != this.width)||(this._bounds.height != this.height)) {
			this._bounds = new Rectangle2D_Double(x,y,width,height);
			this._bounds.setSrs(this.getSrs());
		}
    return this._bounds;
	}

	function containsBbox(newBbox) {			
		var xMin = this.getX();
		var xMax = this.getX() + this.getWidth();
		var yMin = this.getY();
		var yMax = this.getY() + this.getHeight();
		var newXMin = newBbox.getX();
		var newXMax = newBbox.getX() + newBbox.getWidth();
		var newYMin = newBbox.getY();
		var newYMax = newBbox.getY() + newBbox.getHeight();
		
		return ((xMin <= newXMin && newXMin <= xMax) ||
		        (xMax <= newXMax && newXMax <= xMax) ||
		        (yMin <= newYMin && newYMin <= yMax) ||
		        (yMin <= newYMax && newYMax <= yMax));
	}
	
	// Devuelve un poligono que contiene los vertices del rectangulo
	function toPolygon() {
		// lo relleno en el sentido de las agujas del reloj
		var xPointsRectangle = new Array();
		xPointsRectangle[0] = this.getX();
		xPointsRectangle[1] = this.getX();
		xPointsRectangle[2] = this.getX() + this.getWidth();
		xPointsRectangle[3] = this.getX() + this.getWidth();

		var yPointsRectangle = new Array();
		yPointsRectangle[0] = this.getY();
		yPointsRectangle[1] = this.getY() + this.getHeight();
		yPointsRectangle[2] = this.getY() + this.getHeight();
		yPointsRectangle[3] = this.getY();
		
		var newLinearRing = new LinearRing(xPointsRectangle, yPointsRectangle, xPointsRectangle.length);
		var newPolygon = new Polygon(newLinearRing, new Array(0));
		newPolygon.setSrs(this.getSrs());
		return newPolygon;
	}
	
}
Rectangle2D_Double.prototype = new Geometry;

function Point(x,y) {
		// llamar al constructor del padre; equivale al método de Java super()
	this._super = Point2D_Double;
	this._super(x, y);

	this._bounds = null; //new Rectangle2D_Double;

	this.getBounds = getBounds;
	this.getClass = getClass;

	function getBounds() {
		if ((this._bounds == null) ||(this._bounds.x != this.x)||(this._bounds.y != this.y)) {
			this._bounds = new Rectangle2D_Double(x,y,0,0);
			this._bounds.setSrs(this.getSrs());
		}
    return this._bounds;
	}

	function getClass() {
		return Geometry.POINT;
	}
}
Point.prototype = new Point2D_Double;

function Curve() {
	// Interfaz, define 3 metodos:
  // double getLength();
	// GeoPoint getStartPoint();
	// GeoPoint getEndPoint();
}
Curve.prototype = new Geometry;

function Surface() {
	// Interfaz, define 2 metodos:
  // double getArea();
  // double getPerimeter();
}
Surface.prototype = new Geometry;

function LineString(xpoints, ypoints, npoints) {
  /**
  * Número de puntos del LineString.
  */
	this.npoints = npoints || 0;

  /**
  * Coordenadas X de los puntos del LineString.
  */
  this.xpoints = xpoints || new Array(0);

  /**
  * Coordenadas Y de los puntos del LineString.
  */
  this.ypoints = ypoints || new Array(0);

  /**
  * Rectángulo que engloba al LineString.
  */
	this._bounds = null; //new Rectangle2D_Double;
		
	this.getNpoints = getNpoints;
	this.getLength = getLength;
	this._getLength = _getLength;
	this.getStartPoint = getStartPoint;
	this.getEndPoint = getEndPoint;
	this.addPoint = addPoint;
	this.getBounds = getBounds;
	this.setBounds = setBounds;
	this.move = move;
	this._calculateBounds = _calculateBounds;
	this.getClass = getClass;
	this.isInRectangle = isInRectangle;
	
	function getNpoints(){
		return this.npoints;
	}

  /**
	 * Sin parámetros:
   * Calcula longitud del LineString.
   * @return Longitud del LineString
   *
	 * Con parámetros:
   * Calcula la longitud de un tramo dado del GeoLineString. Un tramo es
   * el segmento que une dos puntos consecutivos en un GeoLineString. El primer
   * tramo de un GeoLineString es el 0 y el último es el (this.npoints - 2).
   * @param tramo Tramo dado del GeoLineString
   * @return Longitud del tramo del GeoLineString
   */
	
	function getLength() {

	var length = 0.0;
	for (i=0; i <= this.getNpoints() - 2; i++) {
		length += this._getLength(i);
	}

	return length;
  }
  
  function _getLength(tramo){
  
			if ((tramo >= 0) && (tramo <= this.npoints - 2)) {
				return Math.sqrt((this.xpoints[tramo + 1] - this.xpoints[tramo])
																					* (this.xpoints[tramo + 1] - this.xpoints[tramo])
												+
												 (this.ypoints[tramo + 1] - this.ypoints[tramo])
																					* (this.ypoints[tramo + 1] - this.ypoints[tramo]));
			} else {
				return 0.0;
			}

  }

  /**
   * Obtener punto de comienzo del GeoLineString.
   * @return Punto de comienzo del GeoLineString
   */
  function getStartPoint() {
    return new Point(this.xpoints[0], this.ypoints[0]);
  }

  /**
   * Obtener punto final del GeoLineString.
   * @return Punto final del GeoLineString
   */
  function getEndPoint() {
    return new Point(this.xpoints[this.npoints - 1], this.ypoints[this.npoints - 1]);
  }

  /**
   * Añade un punto a este GeoLineString.
   * Si ya se ha realizado alguna operación que calcule _bounds en este
   * GeoLineString, como <code> getBounds </code> o <code> contains </code>,
   * entonces este método actualiza _bounds.
   * @param x La coordenada X del punto
   * @param y La coordenada Y del punto
   */
  function addPoint(x, y) {
		/* Esto debe ser por usar Java
  	if (this.npoints == this.xpoints.length) {
      double tmp[];
      tmp = new double[this.npoints * 2];
	    System.arraycopy(this.xpoints, 0, tmp, 0, this.npoints);
	    this.xpoints = tmp;
      tmp = new double[this.npoints * 2];
	    System.arraycopy(this.ypoints, 0, tmp, 0, this.npoints);
	    this.ypoints = tmp;
	  }
		*/
	  this.xpoints[this.npoints] = x;
	  this.ypoints[this.npoints] = y;
	  this.npoints++;
    if (this._bounds != null) {
			if (x < this._bounds.x) {
				this._bounds.width = this._bounds.width + (this._bounds.x - x);
				this._bounds.x = x;
			} else {
				this._bounds.width = Math.max(this._bounds.width, x - this._bounds.x);
			}

			if (y < this._bounds.y) {
				this._bounds.height = this._bounds.height + (this._bounds.y - y);
				this._bounds.y = y;
			} else {
				this._bounds.height = Math.max(this._bounds.height, y - this._bounds.y);
			}
	  }
  }

  /**
   * Devuelve la caja mímima (bounding box) que envuelve este GeoLineString.
   * Esta caja es el rectángulo más pequeño cuyos lados son paralelos a los
   * ejes X e Y del espacio de coordenadas, y que puede contener
   * completamente a este GeoLineString.
   * @return Un rectángulo que define la caja que envuelve este GeoLineString
   */
  function getBounds() {
   	if (this._bounds == null) {
	    this._bounds = _calculateBounds(this.xpoints, this.ypoints, this.npoints, this.getSrs());
	  }
	  return this._bounds;
  }
	
  /**
   * Establece un nuevo bounding box para este GeoLineString.
   * @param x Coordenada X izquierda del nuevo bounding box
   * @param y Coordenada Y superior del nuevo bounding box
   * @param w Anchura del nuevo bounding box
   * @param h Altura del nuevo bounding box
   */
	function setBounds(x, y, w, h) {
 	  this._bounds = new Rectangle2D_Double(x, y, w, h);
	}


  /**
   * Mueve el GeoLineString, moviendo cada punto la cantidad pasada como
   * parámetro.
   * @param incx Desplazamiento del GeoLineString en X
   * @param incy Desplazamiento del GeoLineString en Y
   */
  function move(incx, incy)  {
    for (i = 0; i < this.npoints; i++) {
      this.xpoints[i] += incx;
      this.ypoints[i] += incy;
    }
    this._bounds = _calculateBounds(this.xpoints, this.ypoints, this.npoints, this.getSrs());
  }


  /**
   * Calcula la caja que contiene a este GeoLineString.
   * Mete el resultado en _bounds.
   * @param xpoints Un array de coordenadas X
   * @param ypoints Un array de coordenadas Y
   * @param npoints Número de puntos del GeoLineString
   */
  function _calculateBounds(xpoints, ypoints, npoints, srs) {
    boundsMinX = Number.MAX_VALUE;
    boundsMinY = Number.MAX_VALUE;
    boundsMaxX = -Number.MAX_VALUE;
    boundsMaxY = -Number.MAX_VALUE;

    if (npoints > 0) {
      boundsMinX = xpoints[0];
      boundsMinY = ypoints[0];
      boundsMaxX = xpoints[0];
      boundsMaxY = ypoints[0];
    }
    for (i = 1; i < npoints; i++) {
      x = xpoints[i];
	    boundsMinX = Math.min(boundsMinX, x);
	    boundsMaxX = Math.max(boundsMaxX, x);
      y = ypoints[i];
	    boundsMinY = Math.min(boundsMinY, y);
	    boundsMaxY = Math.max(boundsMaxY, y);
	  }
    this._bounds = new Rectangle2D_Double(boundsMinX, boundsMinY,
                                     boundsMaxX - boundsMinX,
                                     boundsMaxY - boundsMinY);
		this._bounds.setSrs(srs);                                   
		return this._bounds;
  }

	function getClass() {
		return Geometry.LINE_STRING;
	}
	
	function isInRectangle(x, y, rect) {						
		// Miro si alguno de los puntos esta dentro del rectangulo pasado
		for(var i = 0; i < this.getNpoints(); i++){
			var xGeom = this.xpoints[i];
			var yGeom = this.ypoints[i];
			if (rect.contains(xGeom, yGeom)) {
				return true;
			}
		}		
		return false;
	}	
}
LineString.prototype = new Curve;

function Line(x1, y1, x2, y2) {
	this.segmentsIntersect = segmentsIntersect;
	
	this.npoints = 2;

  this.xpoints = new Array(2);
	this.xpoints[0] = x1;
	this.xpoints[1] = x2;

	this.ypoints = new Array(2);
	this.ypoints[0] = y1;
	this.ypoints[1] = y2;
	
	this.addPoint = addPoint;
	this.intersect = intersect;

  /**
   * Este método no hace nada. Así se impide crear GeoLines con más de
   * dos puntos.
   */
	function addPoint() {
	}
	
	/**
	 * Comprueba si el segmento pasado intersecta con el nuestro
	 * @param xc line 2 point 1 x
	 * @param yc line 2 point 1 y
	 * @param xd line 2 point 2 x
	 * @param yd line 2 point 2 y
	 * @return Cierto si intersectan, false en caso contrario
	 */
	function segmentsIntersect(xc, yc, xd, yd) {
	
		xa = this.xpoints[0];	// line 1 point 1 x
		ya = this.ypoints[0];	// line 1 point 1 y
		xb = this.xpoints[1];	// line 1 point 2 x
		yb = this.ypoints[1];	// line 1 point 2 y
		
		var ipt = _intersect(xa, ya, xb, yb, xc, yc, xd, yd);
		
		if (ipt == null) {
			return false;
		}
		
		if (Math.abs(xa - xb) > Math.abs(ya - yb)) {
			if (ipt.getX() > Math.max(xa, xb) || ipt.getX() < Math.min(xa, xb))
				return false;
		}
		else {
			if (ipt.getY() > Math.max(ya, yb) || ipt.getY() < Math.min(ya, yb))
				return false;
		}
		
		if (Math.abs(xc - xd) > Math.abs(yc - yd)) {
			if (ipt.getX() > Math.max(xc, xd) || ipt.getX() < Math.min(xc, xd))
				return false;
		}
		else {
			if (ipt.getY() > Math.max(yc, yd) || ipt.getY() < Math.min(yc, yd))
				return false;
		}
				
		return true;
	}	

	/**
     * Standard line intersection algorithm
   	 * Return the point of intersection if it exists, else null
   	**/
	// from Doug Lea's PolygonFigure
	/**
	 * Calcular el punto que intersecta dos lineas
	 * @param xa line 1 point 1 x
	 * @param ya line 1 point 1 y
	 * @param xb line 1 point 2 x
	 * @param yb line 1 point 2 y
	 * @param xc line 2 point 1 x
	 * @param yc line 2 point 1 y
	 * @param xd line 2 point 2 x
	 * @param yd line 2 point 2 y
	 * @return Punto de interseccion si existe, false en caso contrario
	 */
	function _intersect(xa, ya, xb, yb, xc, yc, xd, yd) {
    /* source: http://vision.dai.ed.ac.uk/andrewfg/c-g-a-faq.html
     eq: for lines AB and CD
         (YA-YC)(XD-XC)-(XA-XC)(YD-YC)
     r = -----------------------------  (eqn 1)
         (XB-XA)(YD-YC)-(YB-YA)(XD-XC)
    
         (YA-YC)(XB-XA)-(XA-XC)(YB-YA)
     s = -----------------------------  (eqn 2)
         (XB-XA)(YD-YC)-(YB-YA)(XD-XC)
      XI = XA + r(XB-XA)
      YI = YA + r(YB-YA)
     */

			var denom = ((xb - xa) * (yd - yc) - (yb - ya) * (xd - xc));
	
	    var rnum = ((ya - yc) * (xd - xc) - (xa - xc) * (yd - yc));
	
	    if (denom == 0.0) { // parallel
	    	if (rnum == 0.0) { // coincident; pick one end of first line
	    		if ((xa < xb && (xb < xc || xb < xd)) ||
	    			(xa > xb && (xb > xc || xb > xd)))
	    		return new Point(xb, yb);
	        else
	        	return new Point(xa, ya);
	      }
	      else
	      		return null;
	    }
	
	    var r = rnum / denom;
	
	    var snum = ((ya - yc) * (xb - xa) - (xa - xc) * (yb - ya));
	    var s = snum / denom;
	
	    if (0.0 <= r && r <= 1.0 && 0.0 <= s && s <= 1.0) {
	    	var px = (xa + (xb - xa) * r);
	    	var py = (ya + (yb - ya) * r);
	    	return new Point(px, py);
	    }
	    else
	    	return null;
	}
	
	function intersect(xa, ya, xb, yb, xc, yc, xd, yd) {
		return _intersect(xa, ya, xb, yb, xc, yc, xd, yd);
	}
	
}
Line.prototype = new LineString;

function LinearRing(xpoints, ypoints, npoints) {
		// llamar al constructor del padre; equivale al método de Java super()
	this._super = LineString;
	this._super(xpoints ,ypoints, npoints);

	this.contains = contains;
	this.isClockWise = isClockWise;
	this.getClass = getClass;

	function contains(x, y) {
    if (this.getBounds().contains(x, y)) {
      hits = 0;
      ySave = 0;

      // Find a vertex that is not on the halfline
      var i = 0;
      while ((i < this.npoints) && (this.ypoints[i] == y)) {
        i++;
	    }

      // Walk the edges of the polygon
      for (var n = 0; n < this.npoints; n++) {
        j = (i + 1) % this.npoints;
        dx = this.xpoints[j] - this.xpoints[i];
        dy = this.ypoints[j] - this.ypoints[i];

        // Ignore horizontal edges completely
        if (dy != 0) {
          // Check to see if the edge intersects
          // the horizontal halfline through (x, y)
          rx = x - this.xpoints[i];
          ry = y - this.ypoints[i];

          // Deal with edges starting or ending on the halfline
          if ((this.ypoints[j] == y) && (this.xpoints[j] >= x)) {
            ySave = this.ypoints[i];
		      }
          if ((this.ypoints[i] == y) && (this.xpoints[i] >= x)) {
            if ((ySave > y) != (ypoints[j] > y)) {
      	      hits--;
			      }
		      }

          // Tally intersections with halfline
          s = ry / dy;
          if ((s >= 0.0) && (s <= 1.0) && ((s * dx) >= rx)) {
            hits++;
     		  }
        }
        i = j;
      }
      // Inside if number of intersections odd
      return (hits % 2) != 0;
		}
    return false;
	}

 /**
  * Determinar si los vértices de este GeoLinearRing están en orden clockwise
  * (dirección de las manecillas del reloj) o anti-clockwise (al revés).
  * @return Cierto si los vértices de este GeoLinearRing están en orden clockwise
  */
	function isClockWise() {
    N = this.npoints;
    i = 0;
		j = 0;
    area = 0;

    for (i=0;i<N;i++) {
      j = (i + 1) % N;
      area += this.xpoints[i] * this.ypoints[j];
      area -= this.ypoints[i] * this.xpoints[j];
    }

    return (area < 0);
  }

	function getClass() {
	
		return Geometry.LINEAR_RING;
	}

}
LinearRing.prototype = new LineString;

////////////////////////////////////////////////////////////
// Clase: Polygon 
// Descripción: Representa a un polígono (listado de vértices)
// 							con posibles agujeros (interiorRings)
////////////////////////////////////////////////////////////
function Polygon(exteriorRing, interiorRings) {
	  /**
  	* Frontera externa del GeoPolygon.
	  */
	this.exteriorRing = exteriorRing;
	
		/**
  	* Fronteras internas del GeoPolygon.
	  */
	this.interiorRings = interiorRings || new Array(0);

	this.numInteriorRings = this.interiorRings.length || 0;

	this.getExteriorRing = getExteriorRing;
	this.setExteriorRing = setExteriorRing;
	this.getInteriorRings = getInteriorRings;
	this.getNumInteriorRings = getNumInteriorRings;
	this.getArea = getArea;
	this._getRingArea = _getRingArea;
	this.getPerimeter = getPerimeter;
	this.getBounds = getBounds;
	this.getClass = getClass;
	this.contains = contains;
	this.intersects = intersects;
	this.transformSrs = transformSrs;
	this.setSrs = setSrs;
	
	function setSrs(newSrs) { // sobreescribo la funcion de Geometry pq tengo que establecerselo a sus exterior/interiorRing
		this.srs = newSrs;
		this.exteriorRing.setSrs(newSrs);
		for (var i = 0; i < interiorRings.length; i++) {
			this.interiorRings[i].setSrs(newSrs);
		}
	}

  /**
   * Obtener la frontera externa del polígono.
   * @return Una referencia a la frontera externa del polígono
   */
  function getExteriorRing() {
    return this.exteriorRing;
  }

  function setExteriorRing(newExteriorRing) {
    this.exteriorRing = newExteriorRing;
  }
  
  /**
   * Obtener el número de fronteras internas del polígono.
   * @return Número de fronteras internas del polígono
   */
  function getNumInteriorRings() {
    return this.numInteriorRings;
  }

  /**
   * Obtener las fronteras internas del polígono.
   * @return Una referencia a las fronteras internas del polígono
   */
  function getInteriorRings() {
    return this.interiorRings;
  }

  /**
   * Calcula el área del polígono. El área será la contenida en la frontera
   * externa menos las contenidas en las fronteras internas (agujeros).
   * @return Área del polígono
   */
	function getArea() {
		extArea = _getRingArea(this.exteriorRing);
		
		for (var i = 0; i < this.interiorRings.length; i++) {
			extArea -= _getRingArea(this.interiorRings[i]);
		}
		
		return extArea;
	}

	function _getRingArea(ring) {
    N = ring.npoints;
    i = 0;
		j = 0;
    area = 0;

    for (i=0;i<N;i++) {
      j = (i + 1) % N;
      area += ring.xpoints[i] * ring.ypoints[j];
      area -= ring.ypoints[i] * ring.xpoints[j];
    }

    area /= 2;
    return(area < 0 ? -1*area : area);
	}
	
  /**
  * Devuelve el rectángulo envolvente de este GeoPolygon.
  * @return El rectángulo envolvente de este GeoPolygon
  */
  function getBounds() {
    return this.exteriorRing.getBounds();
  }

 /**
   * Calcula el perímetro del polígono. Este perímetro será la longitud
   * de su frontera externa.
   * @return Perímetro del polígono
   */
	function getPerimeter() {
    return this.exteriorRing.getLength();
  }
  	
	function getClass() {
		return Geometry.POLYGON;
	}
	
  /**
  * Comprueba si este GeoPolygon contiene el punto x,y. Para contenerlo debe
  * estar dentro de la frontera externa, pero no dentro de ninguna frontera
  * interna.
  * @param x Coordenada X del punto
  * @param y Coordenada Y del punto
  * @return Cierto si x,y es contenido por este GeoPolygon
  */
  function contains(x, y) {
    var cont = this.exteriorRing.contains(x,y);
    if (cont) {
      for (var i = 0; i < this.interiorRings.length && cont; i++) {
        cont = ! (this.interiorRing[i].contains(x,y));
      }
    }
    return cont;
  }
	
	/**
	* Comprueba si este GeoPolygon intersecta con el que se pasa por parametro. 
	* @param newPolygon Poligono que queremos intersectar
	* @return Cierto si el poligono pasado intersecta con este GeoPolygon
	*/
	function intersects(newPolygon) {
		// Si son de distinto srs hago una transformacion
		if (newPolygon.getSrs() != this.getSrs()) {
			newPolygon = newPolygon.transformSrs(this.getSrs());
		}
		// Comprobar que sus bbox se intersectan
		var seguir = true;
		if (!this.getBounds().containsBbox(newPolygon.getBounds())) { // el mio contiene al pasado por parametro?
			if (!newPolygon.getBounds().containsBbox(this.getBounds())) { // el pasado por parametro contiene al mio
				seguir = false;
			}			
		}
		if (seguir) {		
			// Comprobar si algun punto de nuestro poligono esta contenido en el pasado por parametro
			for (var i = 0; i < this.exteriorRing.npoints; i++) {
				if (newPolygon.contains(this.exteriorRing.xpoints[i], this.exteriorRing.ypoints[i])) {
					return true;
				}
			}
			// Comprobar si algun punto del otro poligono esta contenido en el nuestro
			for (var i = 0; i < newPolygon.exteriorRing.npoints; i++) {
				if (this.contains(newPolygon.exteriorRing.xpoints[i], newPolygon.exteriorRing.ypoints[i])) {
					return true;
				}
			}
			// Comprobar si algun segmento de nuestro poligono cruza con un segmento del pasado por parametro
			var auxResult = _segmentsIntersects(this, newPolygon);
			if (auxResult) {
				return true;
			}

			// Comprobar si algun segmento del poligono pasado por parametro cruza con un segmento de nuestro poligono
			var auxResult = _segmentsIntersects(newPolygon, this);
			if (auxResult) {
				return true;
			}
		}
		else { // No sigo mirando 
			return false;
		}
		return false;
	}
	
	// Comprobar si algun segmento del poligono 1 cruza con un segmento del poligono 2
	function _segmentsIntersects(polygon1, polygon2) {
		for (var i = 0; i < polygon1.exteriorRing.npoints; i++) {
			var line1 = null;
			if (i != (polygon1.exteriorRing.npoints - 1)) { // formo linea con el punto y el siguiente
				line1 = new Line(polygon1.exteriorRing.xpoints[i], polygon1.exteriorRing.ypoints[i], polygon1.exteriorRing.xpoints[i+1], polygon1.exteriorRing.ypoints[i+1]);					
			}
			else { // formo linea con el ultimo punto y el primero, siempre que no sean el mismo
				if ((polygon1.exteriorRing.xpoints[i] != polygon1.exteriorRing.xpoints[0]) ||  
						(polygon1.exteriorRing.ypoints[i] != polygon1.exteriorRing.ypoints[0])) {
					line1 = new Line(polygon1.exteriorRing.xpoints[i], polygon1.exteriorRing.ypoints[i], polygon1.exteriorRing.xpoints[0], polygon1.exteriorRing.ypoints[0]);
				}
			}
			if (line1 != null) {
				// Comparar este segmento con cada uno de los segmentos del poligono 2
				for (var j = 0; j < polygon2.exteriorRing.npoints; j++) {
					var line2 = null;
					if (j != (polygon2.exteriorRing.npoints - 1)) { // formo linea con el punto y el siguiente
						line2 = new Line(polygon2.exteriorRing.xpoints[j], polygon2.exteriorRing.ypoints[j], polygon2.exteriorRing.xpoints[j+1], polygon2.exteriorRing.ypoints[j+1]);					
					}
					else { // formo linea con el ultimo punto y el primero, siempre que no sean el mismo
						if ((polygon2.exteriorRing.xpoints[j] != polygon2.exteriorRing.xpoints[0]) ||  
								(polygon2.exteriorRing.ypoints[j] != polygon2.exteriorRing.ypoints[0])) {
							line2 = new Line(polygon2.exteriorRing.xpoints[j], polygon2.exteriorRing.ypoints[j], polygon2.exteriorRing.xpoints[0], polygon2.exteriorRing.ypoints[0]);
						}
					}
					if (line2 != null) {
						// Una vez que tengo los dos segmentos, compruebo si se intersectan
						if (line1.segmentsIntersect(line2.xpoints[0], line2.ypoints[0], line2.xpoints[1], line2.ypoints[2])) {
							return true;
						}
					}					
				}
			}				
		}
		return false;
	}
	
	// Transformar el sistema de coordenadas del poligono
	function transformSrs(newSrs) {
		if (this.getSrs() != newSrs) {
			var newPolygon = new Polygon(this.exteriorRing, this.interiorRings);
			for (var i = 0; i < this.exteriorRing.npoints; i++) {
				var punto = mapReference.coordTransform(this.getSrs(), newSrs, this.exteriorRing.xpoints[i], this.exteriorRing.ypoints[i]);		
				newPolygon.exteriorRing.xpoints[i] = punto[0];
				newPolygon.exteriorRing.ypoints[i] = punto[1];	
			}
			// Mirar anillos interiores
      for (var i = 0; i < this.interiorRings.length; i++) {
				for (var j = 0; j < this.interiorRings[i].npoints; j++) {
					var punto = mapReference.coordTransform(this.getSrs(), newSrs, this.interiorRings[i].xpoints[j], this.interiorRings[i].ypoints[j]);		
					newPolygon.interiorRings[i].xpoints[j] = punto[0];
					newPolygon.interiorRings[i].ypoints[j] = punto[1];				
				}
			}			
			newPolygon.setSrs(newSrs);			
		}
		this.exteriorRing = newPolygon.exteriorRing;
		this.interiorRings = newPolygon.interiorRings;
		this.setSrs(newPolygon.getSrs());
		return this;	
	}
  
}
Polygon.prototype = new Surface;