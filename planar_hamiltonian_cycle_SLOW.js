// © m@metaquanta.com 2013

var Set = require('./mqmath.js').Set;
var Edge = require('./mqmath.js').Edge;

// setup canvas.
var res = 3000;
var canvas = new (require('canvas'))(res,res);
var ctx = canvas.getContext('2d');
ctx.fillStyle = '#FFFFFF';
ctx.fillRect(0, 0, res, res);

// random pointset
var n = 1000;
var pointset=[];
for(var i = 0; i < n; i++) {
  pointset[i] = [Math.random(), Math.random()];
}

// get list of nested convex hulls.
var hulls = (function f(hulls, points) {
  if(points.length() == 0) {
    return hulls;
  }
  var h = points.convexHull();
  return f(hulls.concat(h), points.subtract(h.toSet()))
})([], new Set(pointset));

// draw the hulls
/*ctx.strokeStyle="#00FF00";
ctx.lineWidth=3;
for(var i=0; i<hulls.length; i++) {
  var edges = hulls[i].edges();
  ctx.beginPath();
  for(var k=0; k<edges.length; k++) {
    ctx.lineTo(edges[k].u.x*res,edges[k].u.y*res);
    ctx.lineTo(edges[k].v.x*res,edges[k].v.y*res);
  }
  ctx.stroke();
}*/

// Start at outermost Hull, and connect, planarly.
var path = hulls.reduce(function(path, hull, i, a){
  return join_hulls(a[i-1], a[i], path);
});
function join_hulls(hOuter, hInner, path) {
  var edges = hInner.edges();
  // get an edge in the outer cycle that is also on the path.
  var eOuter = hOuter.edges().filter(function(e){return path.hasEdge(e)})[0];
  if(edges.length < 3) {
    if(edges.length == 2) {
      // Cycle produces two edges for two vertices, we only need one.
      edges.pop();
    } else {
      // Just one point.
      return path.insert(eOuter, hInner.verts[0]);
    }
  }
  for(var i = 0; i < edges.length; i++) {
    // Find suitable inner edge.
    var a = new Edge(eOuter.u, edges[i].u), b = new Edge(eOuter.v, edges[i].v);
    var c = new Edge(eOuter.u, edges[i].v), d = new Edge(eOuter.v, edges[i].u);
    if((!a.crosses(hInner) && !b.crosses(hInner) && !a.crosses(b))) {
      // We can join this way...
      return hInner.reverse().connect(edges[i].reverse(), path, eOuter);
    } else if (!c.crosses(hInner) && !d.crosses(hInner) && !c.crosses(d)) {
      // ...or that way.
      return hInner.connect(edges[i], path, eOuter);
    }
  }
}

// draw the path
ctx.strokeStyle='#000000';
ctx.lineWidth=2;
edges = path.edges();
for(var i=0; i<edges.length; i++) {
  ctx.lineTo(edges[i].u.x*res,edges[i].u.y*res);
  ctx.lineTo(edges[i].v.x*res,edges[i].v.y*res);
}
ctx.stroke();

var out = (require('fs')).createWriteStream(__dirname + '/planar_hamiltonian_cycle.png')
var stream = canvas.pngStream();
stream.on('data', function(chunk){
  out.write(chunk);
});
  
