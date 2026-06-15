import { Level, GravityPattern, Obstacle } from './types';

// Simple seeded random to make procedural levels deterministic
function random(seed: number) {
  let t = seed += 0x6D2B79F5;
  t = Math.imul(t ^ t >>> 15, t | 1);
  t ^= t + Math.imul(t ^ t >>> 7, t | 61);
  return ((t ^ t >>> 14) >>> 0) / 4294967296;
}

export function generateLevel(levelNumber: number): Level {
  switch (levelNumber) {
    case 1:
      return {
        id: 1,
        name: "Welcome Funnel",
        gravity: { x: 0, y: 1 },
        gravityPattern: 'constant',
        spawnPoint: { x: 400, y: 50 },
        finishZone: { x: 400, y: 550, w: 200, h: 50 },
        obstacles: [
          { type: 'rectangle', x: 200, y: 250, w: 350, h: 20, angle: 0.3 },
          { type: 'rectangle', x: 600, y: 250, w: 350, h: 20, angle: -0.3 },
          { type: 'rectangle', x: 250, y: 450, w: 200, h: 20, angle: 0.4 },
          { type: 'rectangle', x: 550, y: 450, w: 200, h: 20, angle: -0.4 }
        ]
      };
    case 2:
      return {
        id: 2,
        name: "Plinko Board",
        gravity: { x: 0, y: 0.8 },
        gravityPattern: 'constant',
        spawnPoint: { x: 400, y: 40 },
        finishZone: { x: 400, y: 560, w: 100, h: 40 },
        obstacles: [
          // Create a grid of pins
          ...Array.from({length: 6}).flatMap((_, row) => 
            Array.from({length: row % 2 === 0 ? 7 : 6}).map((_, col) => ({
              type: 'pin' as const,
              x: 180 + col * 80 + (row % 2 === 0 ? 0 : 40),
              y: 150 + row * 60,
              r: 8
            }))
          )
        ]
      };
    case 3:
      return {
        id: 3,
        name: "Bouncy Towers",
        gravity: { x: 0, y: 0.5 },
        gravityPattern: 'constant',
        spawnPoint: { x: 100, y: 50 },
        finishZone: { x: 700, y: 100, w: 100, h: 50 },
        obstacles: [
          { type: 'bouncer', x: 300, y: 500, w: 150, h: 20, angle: -0.2 },
          { type: 'bouncer', x: 600, y: 350, w: 150, h: 20, angle: -0.3 },
          { type: 'rectangle', x: 400, y: 200, w: 20, h: 300, angle: 0 }
        ]
      };
    case 4:
      return {
        id: 4,
        name: "The Wash Cycle",
        gravity: { x: 0, y: 0.6 },
        gravityPattern: 'whirlwind',
        spawnPoint: { x: 400, y: 50 },
        finishZone: { x: 400, y: 550, w: 150, h: 50 },
        obstacles: [
          { type: 'rotator', x: 250, y: 300, w: 250, h: 20, speed: 0.05 },
          { type: 'rotator', x: 550, y: 300, w: 250, h: 20, speed: -0.05 },
          { type: 'pin', x: 400, y: 150, r: 20 },
          { type: 'pin', x: 400, y: 450, r: 20 }
        ]
      };
    case 5:
      return {
        id: 5,
        name: "Zig-Zag Pulse",
        gravity: { x: 0, y: 0.8 },
        gravityPattern: 'pulse',
        spawnPoint: { x: 700, y: 50 },
        finishZone: { x: 100, y: 550, w: 120, h: 50 },
        obstacles: [
          { type: 'rectangle', x: 600, y: 200, w: 500, h: 20, angle: 0.1 },
          { type: 'rectangle', x: 200, y: 350, w: 500, h: 20, angle: -0.1 },
          { type: 'bouncer', x: 700, y: 480, w: 100, h: 20, angle: -0.4 }
        ]
      };
    case 6:
      return {
        id: 6,
        name: "Wave Ride",
        gravity: { x: 0, y: 0.6 },
        gravityPattern: 'wave',
        spawnPoint: { x: 400, y: 50 },
        finishZone: { x: 400, y: 550, w: 150, h: 40 },
        obstacles: [
          { type: 'rectangle', x: 200, y: 200, w: 100, h: 100 },
          { type: 'rectangle', x: 600, y: 200, w: 100, h: 100 },
          { type: 'rectangle', x: 400, y: 350, w: 100, h: 100 },
          { type: 'bouncer', x: 100, y: 450, w: 150, h: 20, angle: 0.3 },
          { type: 'bouncer', x: 700, y: 450, w: 150, h: 20, angle: -0.3 }
        ]
      };
    case 7:
      return {
        id: 7,
        name: "Anti-Gravity Tube",
        gravity: { x: 0, y: 0.7 },
        gravityPattern: 'anti', // pulls UP
        spawnPoint: { x: 400, y: 550 },
        finishZone: { x: 400, y: 50, w: 200, h: 50 },
        obstacles: [
          { type: 'rectangle', x: 300, y: 300, w: 20, h: 400 },
          { type: 'rectangle', x: 500, y: 300, w: 20, h: 400 },
          { type: 'rotator', x: 400, y: 300, w: 150, h: 10, speed: 0.08 }
        ]
      };
    default:
      // Procedural Level (Deterministic)
      let currentSeed = levelNumber * 1234.5678;
      const getRand = () => {
        const val = random(currentSeed);
        currentSeed += val * 1000;
        return val;
      };

      const randomX = getRand() * 600 + 100;
      const finishX = getRand() * 600 + 100;
      
      const obstacleTypes: ('rectangle' | 'rotator' | 'bouncer' | 'pin')[] = ['rectangle', 'rotator', 'bouncer', 'pin'];
      const numObstacles = Math.floor(getRand() * 6) + 4;
      const obstacles: Obstacle[] = [];
      
      for (let i = 0; i < numObstacles; i++) {
        const type = obstacleTypes[Math.floor(getRand() * obstacleTypes.length)];
        obstacles.push({
          type,
          x: getRand() * 600 + 100,
          y: getRand() * 400 + 100,
          w: type === 'pin' ? undefined : (getRand() * 150 + 50),
          h: type === 'pin' ? undefined : 20,
          r: type === 'pin' ? (getRand() * 15 + 10) : undefined,
          angle: (getRand() - 0.5) * Math.PI / 2,
          speed: type === 'rotator' ? ((getRand() - 0.5) * 0.2) : undefined
        });
      }
      
      const patterns: GravityPattern[] = ['constant', 'oscillating', 'whirlwind', 'pulse', 'wave', 'anti'];
      const pat = patterns[Math.floor(getRand() * patterns.length)];
      
      const spawnY = pat === 'anti' ? 550 : 50;
      const finishY = pat === 'anti' ? 50 : 550;
      
      return {
        id: levelNumber,
        name: `Sector ${levelNumber}`,
        gravity: { x: (getRand() - 0.5) * 0.5, y: 0.6 + getRand() * 0.4 },
        gravityPattern: pat,
        spawnPoint: { x: randomX, y: spawnY },
        finishZone: { x: finishX, y: finishY, w: 150, h: 40 },
        obstacles
      };
  }
}
