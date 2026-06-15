export type GravityPattern = 'constant' | 'oscillating' | 'whirlwind' | 'pulse' | 'wave' | 'anti';

export type GameState = 'input' | 'playing' | 'won' | 'lost';

export interface Vector2 {
  x: number;
  y: number;
}

export interface Obstacle {
  type: 'rectangle' | 'rotator' | 'bouncer' | 'pin';
  x: number;
  y: number;
  w?: number;
  h?: number;
  r?: number;
  angle?: number;
  speed?: number;
}

export interface Level {
  id: number;
  name: string;
  gravity: Vector2;
  gravityPattern: GravityPattern;
  spawnPoint: Vector2;
  finishZone: { x: number; y: number; w: number; h: number };
  obstacles: Obstacle[];
}
