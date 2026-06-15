import React, { useEffect, useRef } from 'react';
import Matter from 'matter-js';
import { GameState, Level } from '../types';
import confetti from 'canvas-confetti';
import { createLetterBodies } from '../utils/textPhysics';

interface MatterGameProps {
  level: Level;
  word: string;
  gameState: GameState;
  onWin: () => void;
  onLose?: () => void;
}

export function MatterGame({ level, word, gameState, onWin, onLose }: MatterGameProps) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const renderRef = useRef<Matter.Render | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);
  const lettersRef = useRef<Matter.Body[]>([]);
  const rotatorsRef = useRef<Array<{ body: Matter.Body, speed: number }>>([]);

  useEffect(() => {
    if (!sceneRef.current) return;

    // Setup Engine & Render
    const engine = Matter.Engine.create();
    const render = Matter.Render.create({
      element: sceneRef.current,
      engine: engine,
      options: {
        width: 800,
        height: 600,
        wireframes: false,
        background: '#eaddc5', // Noctua base cream
      }
    });

    engineRef.current = engine;
    renderRef.current = render;

    // Outer Boundaries to prevent falling infinitely
    const boundaries = [
      Matter.Bodies.rectangle(400, -800, 1600, 50, { isStatic: true, render: { fillStyle: '#8f6a48' } }),
      Matter.Bodies.rectangle(400, 1400, 1600, 50, { isStatic: true, render: { fillStyle: '#8f6a48' } }),
      Matter.Bodies.rectangle(-800, 300, 50, 1600, { isStatic: true, render: { fillStyle: '#8f6a48' } }),
      Matter.Bodies.rectangle(1600, 300, 50, 1600, { isStatic: true, render: { fillStyle: '#8f6a48' } }),
    ];
    Matter.World.add(engine.world, boundaries);

    Matter.Render.run(render);
    const runner = Matter.Runner.create();
    runnerRef.current = runner;
    Matter.Runner.run(runner, engine);

    return () => {
      Matter.Render.stop(render);
      Matter.Runner.stop(runner);
      if (render.canvas) render.canvas.remove();
      Matter.World.clear(engine.world, false);
      Matter.Engine.clear(engine);
    };
  }, []);

  // Update level geometry
  useEffect(() => {
    if (!engineRef.current) return;
    const engine = engineRef.current;

    // Clean up level objects
    const bodiesToRemove = engine.world.bodies.filter(b => 
      !b.isStatic || b.label === 'finish' || b.label === 'obstacle' || b.label === 'spawnMarker'
    );
    Matter.World.remove(engine.world, bodiesToRemove);
    lettersRef.current = [];
    rotatorsRef.current = [];

    // Set initial gravity base
    engine.world.gravity.x = level.gravity.x;
    engine.world.gravity.y = level.gravity.y;

    // Create finish zone
    const finishZone = Matter.Bodies.rectangle(
      level.finishZone.x,
      level.finishZone.y,
      level.finishZone.w,
      level.finishZone.h,
      {
        isStatic: true,
        isSensor: true,
        label: 'finish',
        render: { 
          fillStyle: 'rgba(125, 140, 104, 0.2)', // Earthy Noctua Green glow
          strokeStyle: '#647c5d',
          lineWidth: 4
        }
      }
    );

    // Create a spawn marker
    const spawnMarker = Matter.Bodies.circle(
      level.spawnPoint.x,
      level.spawnPoint.y,
      10,
      {
        isStatic: true,
        isSensor: true,
        label: 'spawnMarker',
        render: { fillStyle: '#78533b', opacity: 0.5 }
      }
    );

    // Generate Obstacles
    const dynamicObstacles: {body: Matter.Body, speed: number}[] = [];
    const obstacleBodies = level.obstacles.map(o => {
      let body;
      if (o.type === 'pin') {
        body = Matter.Bodies.circle(o.x, o.y, o.r || 10, {
          isStatic: true,
          label: 'obstacle',
          render: { fillStyle: '#694931' }
        });
      } else if (o.type === 'bouncer') {
        body = Matter.Bodies.rectangle(o.x, o.y, o.w || 100, o.h || 20, {
          isStatic: true,
          angle: o.angle || 0,
          restitution: 0.8,
          label: 'bouncer',
          render: { fillStyle: '#c38d64', strokeStyle: '#8f6a48', lineWidth: 2 }
        });
      } else if (o.type === 'rotator') {
        body = Matter.Bodies.rectangle(o.x, o.y, o.w || 200, o.h || 20, {
          isStatic: true,
          angle: o.angle || 0,
          label: 'obstacle',
          render: { fillStyle: '#a85038', strokeStyle: '#5e3f2b', lineWidth: 2 }
        });
        dynamicObstacles.push({ body, speed: o.speed || 0.05 });
      } else {
        body = Matter.Bodies.rectangle(o.x, o.y, o.w || 200, o.h || 20, {
          isStatic: true,
          angle: o.angle || 0,
          label: 'obstacle',
          render: { fillStyle: '#8f6a48', strokeStyle: '#5e3f2b', lineWidth: 2 }
        });
      }
      return body;
    });

    rotatorsRef.current = dynamicObstacles;
    Matter.World.add(engine.world, [finishZone, spawnMarker, ...obstacleBodies]);
  }, [level]);

  // Handle Gravity & Tick Updates
  useEffect(() => {
    if (!engineRef.current) return;
    const engine = engineRef.current;
    
    let tickCount = 0;
    const updatePhysics = () => {
      tickCount++;
      const pat = level.gravityPattern;
      
      // Update Gravity
      if (pat === 'oscillating') {
        engine.world.gravity.x = level.gravity.x + Math.sin(tickCount * 0.03) * 0.8;
      } else if (pat === 'whirlwind') {
        engine.world.gravity.x = Math.cos(tickCount * 0.04) * 0.7;
        engine.world.gravity.y = level.gravity.y + Math.sin(tickCount * 0.04) * 0.7;
      } else if (pat === 'pulse') {
        engine.world.gravity.y = level.gravity.y * (1 + Math.sin(tickCount * 0.05) * 0.6);
      } else if (pat === 'wave') {
        engine.world.gravity.x = Math.sin(tickCount * 0.02) * 1.5;
      } else if (pat === 'anti') {
        engine.world.gravity.y = -level.gravity.y;
      } else {
        engine.world.gravity.x = level.gravity.x;
        engine.world.gravity.y = level.gravity.y;
      }

      // Update Rotators
      rotatorsRef.current.forEach(({ body, speed }) => {
        Matter.Body.setAngle(body, body.angle + speed);
      });
    };

    Matter.Events.on(engine, 'beforeUpdate', updatePhysics);
    return () => {
      Matter.Events.off(engine, 'beforeUpdate', updatePhysics);
    };
  }, [level]);

  // Handle Game State (Playing, Win detection)
  useEffect(() => {
    if (!engineRef.current) return;
    const engine = engineRef.current;

    if (gameState === 'playing') {
      // Spawn voxel letters!
      const wordBodies = createLetterBodies(word, level.spawnPoint.x, level.spawnPoint.y, 1.2);
      lettersRef.current = wordBodies;
      Matter.World.add(engine.world, wordBodies);

      let hasWon = false;
      const collisionStart = (event: Matter.IEventCollision<Matter.Engine>) => {
        if (hasWon) return;
        
        for (const pair of event.pairs) {
          const bodyA = pair.bodyA;
          const bodyB = pair.bodyB;
          
          // Bouncer logic
          const isBouncerA = bodyA.label === 'bouncer';
          const isBouncerB = bodyB.label === 'bouncer';
          const isLetterA = bodyA.label === 'letter' || bodyA.parent?.label === 'letter';
          const isLetterB = bodyB.label === 'letter' || bodyB.parent?.label === 'letter';
          
          if ((isBouncerA && isLetterB) || (isBouncerB && isLetterA)) {
            const letterPart = isLetterA ? bodyA : bodyB;
            const letterParent = letterPart.parent || letterPart;
            
            // Give the letter an upward/angled burst of velocity
            Matter.Body.setVelocity(letterParent, {
              x: letterParent.velocity.x,
              y: -8
            });
          }

          const isFinish = bodyA.label === 'finish' || bodyB.label === 'finish' || bodyA.parent?.label === 'finish' || bodyB.parent?.label === 'finish';
          const isLetter = isLetterA || isLetterB;

          if (isFinish && isLetter) {
            hasWon = true;
            confetti({
              particleCount: 200,
              spread: 100,
              origin: { y: 0.5, x: 0.5 },
              colors: ['#78533b', '#dfd4bd', '#a85038', '#647c5d']
            });
            onWin();
            break;
          }
        }
      };

      Matter.Events.on(engine, 'collisionStart', collisionStart);
      return () => {
        Matter.Events.off(engine, 'collisionStart', collisionStart);
      };
    } else if (gameState === 'input') {
      // Clear letters on reset
      const bodiesToRemove = lettersRef.current;
      Matter.World.remove(engine.world, bodiesToRemove);
      lettersRef.current = [];
    }
  }, [gameState, word, level, onWin]);

  return (
    <div className="relative border border-[#d1c2a7] rounded-2xl overflow-hidden shadow-sm bg-[#eaddc5] w-full max-w-[800px] aspect-[4/3] mx-auto">
      <div 
        ref={sceneRef} 
        className="absolute inset-0 w-full h-full [&>canvas]:w-full [&>canvas]:h-full" 
      />
    </div>
  );
}
