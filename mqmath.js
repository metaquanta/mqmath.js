// © m@metaquanta.com 2013

function Vector(x, y) { // x,y are ducks
  this.x = x;
  this.y = y;
}
Vector.prototype.transform = function(u, v) {
  // Change basis from {(1,0),(0,1)} to {u,v}
  return (new Matrix(u, v)).invert().dot(this);
}
Vector.prototype.minus = function(v) {
  return new Vector(this.x-v.x, this.y-v.y)
}
Vector.prototype.perp = function(v) {
  return new Vector(-this.y, this.x)
}
Vector.prototype.plus = function(v) {
  return new Vector(this.x+v.x, this.y+v.y)
}
Vector.prototype.scale = function(s) { // s is a duck
  return new Vector(this.x*s, this.y*s)
}
Vector.prototype.theta = function () {
  return Math.atan2(this.y, this.x)
}
Vector.prototype.toString = function() {
  return "V("+this.x+", "+this.y+")";
}

function Matrix(u, v) { // u,v are Vectors
  this.m = [u, v];
}
Matrix.prototype.invert = function() {
  var m = this.m;
  var detinv = 1/(m[0].x*m[1].y - m[0].y*m[1].x);
  return new Matrix(
    new Vector(detinv*m[1].y, -1*detinv*m[0].y),
    new Vector(-1*detinv*m[1].x, detinv*m[0].x));
}
Matrix.prototype.dot = function(u) {
  return new Vector(
    u.x*this.m[0].x+u.y*this.m[1].x, u.x*this.m[0].y+u.y*this.m[1].y);
}

function Cycle(c) { // c is (ordered) array of Vectors.
  this.verts = c || [];
}
Cycle.prototype.connect = function(e, cprime, eprime) {
  // break this at e, break c' at e'
  //  connect endpoints of the two edges, u->v', v->u'
  return new Cycle(
    this.verts.slice(this.verts.indexOf(e.v)).concat(
      this.verts.slice(0, this.verts.indexOf(e.v))).concat(
        cprime.verts.slice(cprime.verts.indexOf(eprime.v))).concat(
        cprime.verts.slice(0, cprime.verts.indexOf(eprime.v)))
  );
}
Cycle.prototype.insert = function(e, p) {
  // break e, connect its endpoints to p
 return new Cycle(
     // shift point list so e becomes the wrap-around and append
    this.verts.slice(this.verts.indexOf(e.v)).concat(
      this.verts.slice(0, this.verts.indexOf(e.v))).concat([p]));
}
Cycle.prototype.hasEdge = function(e) {
  return this.edges().filter(function(v){
    return (v.u == e.u && v.v == e.v) || (v.u == e.v && v.v == e.u)
  }).length > 0;
}
Cycle.prototype.reverse = function() {
  return new Cycle(this.verts.reverse());
}
Cycle.prototype.edges = function() {
  if(this.verts.length == 1) {
    // avoid self-loops. Why?, dunno.
    return [];
  }
  return this.verts.map(function(v, i) {
    return new Edge(v, this.verts[i+1] || this.verts[0])
  }, this);
}
Cycle.prototype.toSet = function() {
  return new Set(this.verts);
}

function Edge(u, v) { // u,v are Vectors.
  this.u = u;
  this.v = v;
}
Edge.prototype.crosses = function(e) {
  if(e instanceof Cycle) {
    return function(edge) {
      return e.edges().map(
        function(v){return edge.crosses(v);}
      ).reduce(function(p,v){return p||v});
    }(this);
  }
  // Algo I just invented since I had a convexHull() laying around.
  var h = (new Set([this.u, this.v, e.u, e.v])).convexHull();
  // Hull will always be a triangle or quadrilateral, if one edge is on it, it can't
  //  possibly cross the other.
  if(h.hasEdge(e) || h.hasEdge(this)) {
    return false;
  }
  return true;
}
Edge.prototype.reverse = function() {
  return new Edge(this.v, this.u);
}
Edge.prototype.toString = function() {
  return ""+this.u+"<->"+this.v;
}

function Set(s) { // s is 2-dim array of points, or array of Vectors.
  if(Array.isArray(s[0])) {
    this.set = s.map(function(v) {return new Vector(v[0], v[1])});
  } else if(s[0] instanceof Vector) {
    this.set = s;
  } else {
    this.set = [];
  }
}
Set.prototype.convexHull = function(hull) {
  // Alg I invented, I'm sure it's far from optimal.

  // a triange is a triange.
  if(this.set.length <= 3) {return new Cycle(this.set);}

  if(hull == undefined) {
    // initialize recursion.
    // seed the cycle with the two furthest points along x-axis.
    //   (they are on the hull)
    return this.convexHull(
      new Cycle(
        [this.maxBy(function(v){return -v.x;}),
        this.maxBy(function(v){return v.x;})]));
  }

  // for each edge in the cycle, if any points are "above" it,
  //   add the "highest," perpendicularly. (it's on the hull)
  for(var i = 0; i < hull.edges().length; i++) {
    var n  = this.maxBy(function(v) {
      var b = hull.edges()[i].u.minus(hull.edges()[i].v);
      return v.transform(b, b.perp()).y
    });
    if(n != hull.edges()[i].u && n != hull.edges()[i].v) {
      return this.convexHull(hull.insert(hull.edges()[i], n));
    }
  }

  // no points found outside the cycle, hull is complete.
  return hull;
}
Set.prototype.maxBy = function(func) {
  // just max() with callback.
  return this.set[this.set.map(func).reduce(
    function(p,v,i,a){return v>a[p] ? i : p}, 0)];
}
Set.prototype.subtract = function(s) {
  return new Set(this.set.filter(function(v){return s.set.indexOf(v) == -1}));
}
Set.prototype.length = function() {
  return this.set.length;
}

// Extensive use of object equality is used concerned Vectors. They should not
//  be created outside.
exports.Vector = Vector;

exports.Cycle = Cycle;
exports.Matrix = Matrix;
exports.Set = Set;
exports.Edge = Edge;
