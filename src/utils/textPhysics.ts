import Matter from 'matter-js';

export function createLetterBodies(word: string, startX: number, startY: number, scale = 1.2): Matter.Body[] {
  const allBodies: Matter.Body[] = [];
  
  const cols = 28;
  const rows = 36;
  const charSpacing = cols * scale * 0.7; 
  
  const totalWidth = word.length * charSpacing;
  let currentX = startX - totalWidth / 2 + charSpacing / 2;
  
  const canvas = document.createElement('canvas');
  canvas.width = cols;
  canvas.height = rows;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return [];
  
  for (const char of word) {
    if (char.trim() === '') {
      currentX += charSpacing;
      continue;
    }
    
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, cols, rows);
    ctx.fillStyle = 'white';
    ctx.font = 'bold 28px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(char, cols / 2, rows / 2);
    
    const imgData = ctx.getImageData(0, 0, cols, rows).data;
    const grid = new Array(rows).fill(0).map(() => new Array(cols).fill(0));
    
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const i = (y * cols + x) * 4;
        if (imgData[i] > 100) {
          grid[y][x] = 1;
        }
      }
    }
    
    // 8-way connected components
    const visited = new Array(rows).fill(0).map(() => new Array(cols).fill(false));
    const components: Array<Array<{x: number, y: number}>> = [];
    
    const dirs = [
      [-1,-1], [-1,0], [-1,1],
      [0,-1],           [0,1],
      [1,-1],  [1,0],  [1,1]
    ];
    
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        if (grid[y][x] === 1 && !visited[y][x]) {
          const comp: Array<{x: number, y: number}> = [];
          const queue = [{x, y}];
          visited[y][x] = true;
          
          while (queue.length > 0) {
            const curr = queue.shift()!;
            comp.push(curr);
            
            for (const d of dirs) {
              const nx = curr.x + d[0];
              const ny = curr.y + d[1];
              if (nx >= 0 && nx < cols && ny >= 0 && ny < rows && grid[ny][nx] === 1 && !visited[ny][nx]) {
                visited[ny][nx] = true;
                queue.push({x: nx, y: ny});
              }
            }
          }
          components.push(comp);
        }
      }
    }
    
    for (const comp of components) {
      if (comp.length < 2) continue; // skip small debris noise
      
      const parts: Matter.Body[] = [];
      const points = new Set(comp.map(p => `${p.x},${p.y}`));
      const used = new Set<string>();
      
      for (const p of comp) {
        const key = `${p.x},${p.y}`;
        if (used.has(key)) continue;
        
        let w = 1;
        while (points.has(`${p.x + w},${p.y}`) && !used.has(`${p.x + w},${p.y}`)) {
          w++;
        }
        
        for (let i = 0; i < w; i++) {
          used.add(`${p.x + i},${p.y}`);
        }
        
        const rectX = (p.x + w / 2) * scale;
        const rectY = (p.y + 0.5) * scale;
        
        parts.push(Matter.Bodies.rectangle(rectX, rectY, w * scale, scale, {
          render: { fillStyle: '#5e3f2b', strokeStyle: '#4a3123', lineWidth: 0.5 }
        }));
      }
      
      if (parts.length > 0) {
        const body = Matter.Body.create({
          parts: parts,
          friction: 0.3,
          restitution: 0.4,
          density: 0.005,
          label: 'letter'
        });
        
        Matter.Body.translate(body, {
          x: currentX - (cols * scale / 2),
          y: startY - (rows * scale / 2)
        });
        
        allBodies.push(body);
      }
    }
    
    currentX += charSpacing;
  }
  
  return allBodies;
}
