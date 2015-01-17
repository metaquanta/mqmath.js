// © m@metaquanta.com 2015

// This program finds and draws a Hamiltonian cycle for a random
// pointset.
// I believe it is optimal as it is as fast as sorting.

var Vector = require('./mqmath.js').Vector;

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
  pointset[i] = new Vector(Math.random(), Math.random());
}

// find a good origin
var o = pointset.reduce(function(acc, v) {return acc.plus(v)}).scale(1/n)

// now sort points by theta wrt origin
pointset.sort(function(u, v) {
  var uprime = u.minus(o).theta()
  var vprime = v.minus(o).theta()
  if(uprime < vprime) return -1
  if(vprime < uprime) return 1
  return 0 // this shouldn't happen
})

// draw the path
ctx.strokeStyle='#000000';
ctx.lineWidth=2;
for(var i=0; i<n; i++) {
  ctx.lineTo(pointset[i].x*res,pointset[i].y*res);
}
ctx.lineTo(pointset[0].x*res,pointset[0].y*res);
ctx.stroke();

var out = (require('fs')).createWriteStream(__dirname + '/planar_hamiltonian_cycle.png')
var stream = canvas.pngStream();
stream.on('data', function(chunk){
  out.write(chunk);
});
