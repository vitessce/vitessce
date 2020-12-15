/* eslint-disable */
import { quadtree } from 'd3-quadtree';

function constant(v) {
    return function () { return v; }
}

function jiggle(v) {
    return v + (Math.random() - 0.5) * 1e-6;
}

// Reference: https://bl.ocks.org/cmgiven/547658968d365bcc324f3e62e175709b
export function forceCollideRects() {
    let nodes;
    let masses;
    let strength = 1;
    let iterations = 1;
    
    let sizes;
    let size = constant([0, 0]);
      
    function xCenter(d) {
      return d.x + d.vx + sizes[d.index][0] / 2;
    }
  
    function yCenter(d) {
      return d.y + d.vy + sizes[d.index][1] / 2;
    }
  
    function force() {
        let node;
        let size;
        let mass;
        let xi;
        let yi;
        let i = -1;

        while (++i < iterations) {
            iterate();
        }

        function iterate() {
            let j = -1;
            let tree = quadtree(nodes, xCenter, yCenter).visitAfter(prepare);

            while(++j < nodes.length) {
                node = nodes[j];
                size = sizes[j];
                mass = masses[j];
                xi = xCenter(node);
                yi = yCenter(node);

                tree.visit(apply);
            }
        }

    
        function apply(quad, x0, y0, x1, y1) {
            let data = quad.data;
            let xSize = (size[0] + quad.size[0]) / 2;
            let ySize = (size[1] + quad.size[1]) / 2;

            if (data) {
                if (data.index <= node.index) { return };

                let x = jiggle(xi - xCenter(data));
                let y = jiggle(yi - yCenter(data));
                let xd = Math.abs(x) - xSize;
                let yd = Math.abs(y) - ySize;

                if(xd < 0 && yd < 0) {
                    let l = Math.sqrt(x * x + y * y);
                    let m = masses[data.index] / (mass + masses[data.index]);

                    if(Math.abs(xd) < Math.abs(yd)) {
                        node.vx -= (x *= xd / l * strength) * m;
                        data.vx += x * (1 - m);
                    } else {
                        node.vy -= (y *= yd / l * strength) * m;
                        data.vy += y * (1 - m);
                    }
                }
            }

            return x0 > xi + xSize || x1 < xi - xSize || y0 > yi + ySize || y1 < yi - ySize;
        }
    }
  
    function prepare(quad) {
        if (quad.data) {
            quad.size = sizes[quad.data.index];
        } else {
            quad.size = [0, 0];
            let i = -1;
            while(++i < 4) {
                if(quad[i] && quad[i].size) {
                    quad.size[0] = Math.max(quad.size[0], quad[i].size[0]);
                    quad.size[1] = Math.max(quad.size[1], quad[i].size[1]);
                }
            }
        }
    }
  
    force.initialize = function(v) {
        nodes = v;
        sizes = nodes.map(size);
        masses = sizes.map(d => d[0] + d[1]);
    };
  
    force.iterations = function(v) {
        if(arguments.length) {
            iterations = +v;
            return force;
        }
        return iterations;
    };
  
    force.strength = function(v) {
        if(arguments.length) {
            strength = +v;
            return force;
        }
        return strength;
    };

    
    force.size = function (v) {
        if(arguments.length) {
            size = (typeof v === 'function' ? v : constant(v));
            return force;
        }
        return size;
    };
  
    return force;
}