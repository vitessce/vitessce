import { matter } from "@vitessce/gl";
const { Engine, Events, Runner, Render, World, Body, Mouse, Common, Bodies } = matter;

// TODO: explore:
// - polygon filtering based on area? https://turfjs.org/docs/api/area
// - polygon simplification? https://turfjs.org/docs/api/simplify
// - polygon decomposition with https://github.com/schteppe/poly-decomp.js
// - creation of polygon body with Bodies.fromVertices https://brm.io/matter-js/docs/classes/Bodies.html#method_fromVertices


export function createBodies() {
  const bodies = [];
  // create a body with an attractor
  const attractiveBody = Bodies.circle(
    width / 2,
    height / 2,
    50, 
    {
    isStatic: true,

    // example of an attractor function that 
    // returns a force vector that applies to bodyB
    plugin: {
      attractors: [
        function(bodyA, bodyB) {
          return {
            x: (bodyA.position.x - bodyB.position.x) * 1e-5,
            y: (bodyA.position.y - bodyB.position.y) * 1e-5,
          };
        }
      ]
    }
  });

  bodies.push(attractiveBody);

  // add some bodies that to be attracted
  for (let i = 0; i < 150; i += 1) {
    const body = Bodies.polygon(
      Common.random(0, width),
      Common.random(0, height),
      Common.random(1, 5),
      Common.random() > 0.9 ? Common.random(15, 25) : Common.random(5, 10)
    );

    bodies.push(body);
  }
  return bodies;
}

export function simulateBodies(bodies, numTicks) {
  const engine = Engine.create();

  // create demo scene
  const { world } = engine;
  world.gravity.scale = 0;

  bodies.forEach((body) => {
    World.add(world, body);
  });

  for(let i = 0; i < numTicks; i++) {
    Engine.update(engine, 1000 / 60); 
  }

  return engine.world.bodies;
}