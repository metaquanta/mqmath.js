var Matrix = require('../mqmath.js').Matrix;
var Vector = require('../mqmath.js').Vector;
var Set = require('../mqmath.js').Set;
var Edge = require('../mqmath.js').Edge;
var Cycle = require('../mqmath.js').Cycle;
var assert = require('assert')

describe('Vector', function(){
  describe('#transform', function(){
    it('preserves identity', function(){
      var v = new Vector(-.43,1.73);
      assert.deepEqual(v, v.transform(new Vector(1,0), new Vector(0,1)));
    });
    it('inverts', function(){
      var v = new Vector(-.43,1.73);
      assert.deepEqual(v.perp(), v.transform(new Vector(0,-1), new Vector(1,0)));
    });
  })
})

describe('Cycle', function(){
  describe('#new', function(){
    it('is sane', function(){
      var s = new Cycle([new Vector(-4,8), new Vector(-1,-7)]);
      assert.equal(s.edges().length, 2);
      assert.notEqual(s.edges()[0].u, undefined);
      assert.notEqual(s.edges()[1].v, undefined);
      assert.equal(s.edges()[2], undefined);
    });
  });
  describe('#insert()', function(){
    it('should insert element', function(){
      var a = new Vector(-4,8), b = new Vector(-1,-7), c = new Vector(1,1);
      var s = new Cycle([a, b]);
      s = s.insert(s.edges()[0], c);
      assert.equal(s.edges().length, 3);
    });
    it('should insert element in the right place', function(){
      var a = new Vector(-1,1), b = new Vector(-1,-1), c = new Vector(1,1), d = new Vector(1,-1)
      var s = new Cycle([a, b, d]);
      s = s.insert(s.edges()[2], c);
      assert.equal(s.edges().length, 4);
    });
  });
  describe('#hasEdge', function(){
    it('succeeds', function(){
      var u = new Vector(-4,8), v = new Vector(-1,-7)
      var e = new Edge(u,v);
      var e2 = new Edge(v,u);
      var s = new Set([u,v,new Vector(0,0),new Vector(-2,9)]);
      var c = s.convexHull();
      assert.equal(c.hasEdge(e), true);
      assert.equal(c.hasEdge(e2), true);
    });
    it('fails', function(){
      var u = new Vector(0,0), v = new Vector(-4,8)
      var e = new Edge(u,v);
      var e2 = new Edge(v,u);
      var s = new Set([u,v,new Vector(-1,-7),new Vector(-2,9)]);
      var c = s.convexHull();
      assert.equal(c.hasEdge(e), false);
      assert.equal(c.hasEdge(e2), false);
    });
  });
})

describe('Matrix', function(){
  describe('#dot()', function(){
    it('should do nothing with an identity matrix', function(){
      var I = new Matrix(new Vector(1,0), new Vector(0,1));
      var u = new Vector(-5,7);
      assert.deepEqual(I.dot(u), u);
    });
    it('should flip', function(){
      var I = new Matrix(new Vector(0,1), new Vector(1,0));
      var u = new Vector(-5,7);
      assert.equal(I.dot(u).x, u.y);
      assert.equal(I.dot(u).y, u.x);
    })
  });
  describe('#inverse()', function(){
    it('preserves identity', function(){
      var M = new Matrix(new Vector(1,0), new Vector(0,1));
      assert.deepEqual(M.m[0], new Vector(1,0));
      assert.deepEqual(M.m[1], new Vector(0,1));
      var Minv = M.invert();
      assert.deepEqual(Minv.m[0], new Vector(1,0));
      assert.deepEqual(Minv.m[1], new Vector(0,1));
    });
    it('inverts', function(){
      var M = new Matrix(new Vector(8,-4), new Vector(2,-12));
      var Minv = M.invert();
      assert.equal(Minv.m[0].x*44, 6);
      assert.equal(Minv.m[0].y*44, -2);
      assert.equal(Minv.m[1].x*44, 1);
      assert.equal(Minv.m[1].y*44, -4);
    });
    it('does this', function(){
      var M = new Matrix(new Vector(1,2), new Vector(3,7));
      var Minv = M.invert();
      assert.equal(Minv.m[0].x, 7);
      assert.equal(Minv.m[0].y, -2);
      assert.equal(Minv.m[1].x, -3);
      assert.equal(Minv.m[1].y, 1);
    });
  })
})

describe('Set', function(){
  describe('#new', function(){
    it('is sane', function(){
      var s = new Set([[-4,8],[-1,-7],[-2,9]]);
      assert.deepEqual(s.set[0], new Vector(-4, 8));
      assert.deepEqual(s.set[2], new Vector(-2, 9));
    });
  });
  describe('#maxBy()', function(){
    it('should return leftmost element', function(){
      var s = new Set([[-4,8],[-1,-7],[-2,9],[0,0],[-5,-.1],[4,2]]);
      var r = s.maxBy(function(v){return -v.x;});
      assert.deepEqual(r, new Vector(-5, -.1));
    });
  });
  describe('#convexHull()', function(){
    it('should give us the provided square', function(){
      var s = new Set([[-4,8],[-1,-7],[-2,9],[0,0]]);
      var c = s.convexHull();
      assert.deepEqual(c.verts, new Set([[-4,8],[-1,-7],[0,0],[-2,9]]).set);
    });
  });
  describe('#convexHull()', function(){
    it('should give us the outer square', function(){
      var s = new Set([[-4,8],[-1,-7],[-1,0],[-2,9],[0,0]]);
      var c = s.convexHull();
      assert.deepEqual(c.verts, new Set([[-4,8],[-1,-7],[0,0],[-2,9]]).set);
    });
  });
})

