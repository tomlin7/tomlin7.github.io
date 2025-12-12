'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Bug, Edit } from 'lucide-react';

const TILE_SIZE = 8;
const SCALE = 3;
const ACTUAL_TILE_SIZE = TILE_SIZE * SCALE;
const TILEMAP_COLS = 24;

interface EntityConfig {
    id: number;
    type: 'car' | 'train';
    right: number[];
    left: number[];
    up: number[];
    down: number[];
}

interface LevelData {
    width: number;
    height: number;
    tileSize: number;
    layers: { name: string; data: number[] }[];
    drivable: number[];
    walkable: number[];
    entityConfigs?: EntityConfig[];
}

interface Entity {
    id: number;
    x: number;
    y: number;
    targetX: number;
    targetY: number;
    speed: number;
    color: string;
    vx: number;
    vy: number;
    config?: EntityConfig;
    isPedestrian?: boolean;
}

export default function CitySimulation() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [levelData, setLevelData] = useState<LevelData | null>(null);
    const [tilemap, setTilemap] = useState<HTMLImageElement | null>(null);

    // Game State
    const carsRef = useRef<Entity[]>([]);
    const pedestriansRef = useRef<Entity[]>([]);
    const requestRef = useRef<number>(0);

    const [hoveredTile, setHoveredTile] = useState<number | null>(null);
    const [showDrivable, setShowDrivable] = useState(false);

    useEffect(() => {
        const img = new Image();
        img.src = '/city/tilemap_packed.png';
        img.onload = () => setTilemap(img);

        fetch('/city/data.json')
            .then(res => res.json())
            .then(data => setLevelData(data))
            .catch(err => console.error("Failed to load map data", err));
    }, []);

    // Initialize Simulation
    useEffect(() => {
        if (!levelData) return;

        // --- Cars ---
        const carConfigs = levelData.entityConfigs?.filter(e => e.type === 'car') || [];
        const carSpawnPoints: { x: number, y: number }[] = [];
        levelData.drivable.forEach((flag, index) => {
            if (flag > 0) {
                const x = (index % levelData.width) * ACTUAL_TILE_SIZE;
                const y = Math.floor(index / levelData.width) * ACTUAL_TILE_SIZE;
                carSpawnPoints.push({ x, y });
            }
        });

        const newCars: Entity[] = [];
        if (carConfigs.length > 0) {
            for (let i = 0; i < 40; i++) {
                if (carSpawnPoints.length > 0) {
                    const spawn = carSpawnPoints[Math.floor(Math.random() * carSpawnPoints.length)];
                    const randomConfig = carConfigs[Math.floor(Math.random() * carConfigs.length)];

                    // Simple hack to avoid stacking spawns too much
                    const tooClose = newCars.some(c => Math.hypot(c.x - spawn.x, c.y - spawn.y) < ACTUAL_TILE_SIZE);
                    if (!tooClose) {
                        newCars.push({
                            id: i,
                            x: spawn.x + ACTUAL_TILE_SIZE / 2,
                            y: spawn.y + ACTUAL_TILE_SIZE / 2,
                            targetX: spawn.x + ACTUAL_TILE_SIZE / 2,
                            targetY: spawn.y + ACTUAL_TILE_SIZE / 2,
                            speed: 0.5 + Math.random() * 1.5,
                            color: `hsl(${Math.random() * 360}, 85%, 60%)`,
                            vx: 0,
                            vy: 0,
                            config: randomConfig
                        });
                    }
                }
            }
        }
        carsRef.current = newCars;

        // --- Pedestrians ---
        const pedSpawnPoints: { x: number, y: number }[] = [];
        levelData.walkable.forEach((flag, index) => {
            if (flag === 1) {
                const x = (index % levelData.width) * ACTUAL_TILE_SIZE;
                const y = Math.floor(index / levelData.width) * ACTUAL_TILE_SIZE;
                pedSpawnPoints.push({ x, y });
            }
        });

        const newPeds: Entity[] = [];
        for (let i = 0; i < 50; i++) {
            if (pedSpawnPoints.length > 0) {
                const spawn = pedSpawnPoints[Math.floor(Math.random() * pedSpawnPoints.length)];
                const offsetX = (Math.random() - 0.5) * (ACTUAL_TILE_SIZE * 0.5);
                const offsetY = (Math.random() - 0.5) * (ACTUAL_TILE_SIZE * 0.5);

                newPeds.push({
                    id: i + 1000,
                    x: spawn.x + ACTUAL_TILE_SIZE / 2 + offsetX,
                    y: spawn.y + ACTUAL_TILE_SIZE / 2 + offsetY,
                    targetX: spawn.x + ACTUAL_TILE_SIZE / 2 + offsetX,
                    targetY: spawn.y + ACTUAL_TILE_SIZE / 2 + offsetY,
                    speed: 0.2 + Math.random() * 0.3,
                    color: `hsl(${Math.random() * 360}, 60%, 70%)`,
                    vx: 0,
                    vy: 0,
                    isPedestrian: true
                });
            }
        }
        pedestriansRef.current = newPeds;

    }, [levelData]);

    // Simulation Loop
    useEffect(() => {
        if (!tilemap || !levelData) return;

        const loop = () => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            // --- Update Cars with Collision Detection ---
            const cars = carsRef.current;
            for (let i = 0; i < cars.length; i++) {
                const car = cars[i];
                let shouldMove = true;

                // Check for car in front
                if (car.vx !== 0 || car.vy !== 0) {
                    // Look ahead distance
                    const lookAhead = ACTUAL_TILE_SIZE * 1.5;
                    const projX = car.x + Math.sign(car.vx) * lookAhead;
                    const projY = car.y + Math.sign(car.vy) * lookAhead;

                    for (let j = 0; j < cars.length; j++) {
                        if (i === j) continue;
                        const other = cars[j];
                        const dist = Math.hypot(projX - other.x, projY - other.y);

                        // If another car is close in our projected path, STOP.
                        if (dist < ACTUAL_TILE_SIZE) {
                            shouldMove = false;
                            break;
                        }
                    }
                }

                if (shouldMove) {
                    updateEntity(car, levelData.drivable, levelData.width, levelData.height);
                }
            }

            // --- Update Pedestrians (No collision for now) ---
            pedestriansRef.current.forEach(ped => {
                updateEntity(ped, levelData.walkable, levelData.width, levelData.height, true);
            });

            // Render
            ctx.fillStyle = '#18181b';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.imageSmoothingEnabled = false;

            // Draw Ground Layer (Index 0)
            if (levelData.layers.length > 0) {
                const layer = levelData.layers[0];
                for (let i = 0; i < layer.data.length; i++) {
                    const tileId = layer.data[i];
                    if (tileId === 0) continue;

                    const x = (i % levelData.width) * ACTUAL_TILE_SIZE;
                    const y = Math.floor(i / levelData.width) * ACTUAL_TILE_SIZE;

                    const sheetIndex = tileId - 1;
                    const sx = (sheetIndex % TILEMAP_COLS) * TILE_SIZE;
                    const sy = Math.floor(sheetIndex / TILEMAP_COLS) * TILE_SIZE;

                    ctx.drawImage(
                        tilemap,
                        sx, sy, TILE_SIZE, TILE_SIZE,
                        x, y, ACTUAL_TILE_SIZE, ACTUAL_TILE_SIZE
                    );
                }
            }

            // Draw Cars (Now between Ground and Objects)
            carsRef.current.forEach(car => {
                if (!car.config) return;

                let tiles: number[] = [];
                let isVertical = false;

                if (Math.abs(car.vy) > Math.abs(car.vx)) {
                    isVertical = true;
                    if (car.vy > 0) tiles = car.config.down; // Down
                    else tiles = car.config.up; // Up
                } else {
                    if (car.vx < 0) tiles = car.config.left;
                    else tiles = car.config.right;
                }

                if (tiles.every(t => t === 0)) return;

                const tileCount = tiles.length;
                const totalLength = tileCount * ACTUAL_TILE_SIZE;

                const startX = car.x - (isVertical ? ACTUAL_TILE_SIZE / 2 : totalLength / 2);
                const startY = car.y - (isVertical ? totalLength / 2 : ACTUAL_TILE_SIZE / 2);

                tiles.forEach((tid, idx) => {
                    if (tid === 0) return;

                    const sheetIndex = tid - 1;
                    const sx = (sheetIndex % TILEMAP_COLS) * TILE_SIZE;
                    const sy = Math.floor(sheetIndex / TILEMAP_COLS) * TILE_SIZE;

                    let drawX = startX;
                    let drawY = startY;

                    if (isVertical) {
                        drawY += idx * ACTUAL_TILE_SIZE;
                    } else {
                        drawX += idx * ACTUAL_TILE_SIZE;
                    }

                    ctx.drawImage(
                        tilemap,
                        sx, sy, TILE_SIZE, TILE_SIZE,
                        drawX, drawY,
                        ACTUAL_TILE_SIZE, ACTUAL_TILE_SIZE
                    );
                });
            });

            // Draw Pedestrians (Now between Ground and Objects)
            pedestriansRef.current.forEach(ped => {
                ctx.fillStyle = 'white';
                ctx.beginPath();
                ctx.arc(ped.x, ped.y, SCALE, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = ped.color;
                ctx.beginPath();
                ctx.arc(ped.x, ped.y, SCALE * 0.6, 0, Math.PI * 2);
                ctx.fill();
            });

            // Draw Remaining Layers (Objects, etc.)
            for (let l = 1; l < levelData.layers.length; l++) {
                const layer = levelData.layers[l];
                for (let i = 0; i < layer.data.length; i++) {
                    const tileId = layer.data[i];
                    if (tileId === 0) continue;

                    const x = (i % levelData.width) * ACTUAL_TILE_SIZE;
                    const y = Math.floor(i / levelData.width) * ACTUAL_TILE_SIZE;

                    const sheetIndex = tileId - 1;
                    const sx = (sheetIndex % TILEMAP_COLS) * TILE_SIZE;
                    const sy = Math.floor(sheetIndex / TILEMAP_COLS) * TILE_SIZE;

                    ctx.drawImage(
                        tilemap,
                        sx, sy, TILE_SIZE, TILE_SIZE,
                        x, y, ACTUAL_TILE_SIZE, ACTUAL_TILE_SIZE
                    );
                }
            }



            // Debug Layers
            if (showDrivable) {
                ctx.fillStyle = 'rgba(0, 255, 100, 0.15)';
                levelData.drivable.forEach((flag, i) => {
                    if (flag) {
                        const x = (i % levelData.width) * ACTUAL_TILE_SIZE;
                        const y = Math.floor(i / levelData.width) * ACTUAL_TILE_SIZE;
                        ctx.fillRect(x, y, ACTUAL_TILE_SIZE, ACTUAL_TILE_SIZE);
                    }
                });

                ctx.fillStyle = 'rgba(0, 100, 255, 0.15)';
                levelData.walkable.forEach((flag, i) => {
                    if (flag) {
                        const x = (i % levelData.width) * ACTUAL_TILE_SIZE;
                        const y = Math.floor(i / levelData.width) * ACTUAL_TILE_SIZE;
                        ctx.fillRect(x, y, ACTUAL_TILE_SIZE, ACTUAL_TILE_SIZE);
                    }
                });
            }

            requestRef.current = requestAnimationFrame(loop);
        };

        requestRef.current = requestAnimationFrame(loop);
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [tilemap, levelData, showDrivable]);

    if (!levelData) return (
        <div className="h-screen w-screen bg-zinc-950 flex items-center justify-center text-zinc-400 font-mono">
            Loading City Data...
        </div>
    );

    return (
        <div className="h-screen w-screen bg-zinc-950 overflow-hidden relative font-sans">
            {/* HUD / Controls */}
            <div className="absolute top-4 right-4 z-50 flex items-center gap-3">
                {/* Tile Info */}
                <div className="px-3 py-1.5 rounded-lg bg-zinc-900/90 backdrop-blur border border-zinc-800 text-xs font-mono text-zinc-400 shadow-xl">
                    Tile ID: <span className="text-white">{hoveredTile ?? '-'}</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowDrivable(!showDrivable)}
                        className={`p-2 rounded-lg transition border shadow-xl ${showDrivable
                            ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-400'
                            : 'bg-zinc-900/90 hover:bg-zinc-800 border-zinc-800 text-zinc-400'
                            }`}
                        title="Toggle Debug Layer"
                    >
                        <Bug className="w-5 h-5" />
                    </button>

                    <a
                        href="/city/editor"
                        className="p-2 rounded-lg bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 transition shadow-xl"
                        title="Open Editor"
                    >
                        <Edit className="w-5 h-5" />
                    </a>
                </div>
            </div>

            {/* Viewport */}
            <div className="w-full h-full overflow-auto flex items-center justify-center bg-[#101012]">
                <canvas
                    ref={canvasRef}
                    width={levelData.width * ACTUAL_TILE_SIZE}
                    height={levelData.height * ACTUAL_TILE_SIZE}
                    className="block shadow-2xl bg-[#000]"
                    onMouseMove={(e) => {
                        if (!levelData || !canvasRef.current) return;
                        const rect = canvasRef.current.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        const y = e.clientY - rect.top;
                        const gx = Math.floor(x / ACTUAL_TILE_SIZE);
                        const gy = Math.floor(y / ACTUAL_TILE_SIZE);
                        const index = gy * levelData.width + gx;
                        if (levelData.layers[0] && index >= 0 && index < levelData.layers[0].data.length) {
                            setHoveredTile(levelData.layers[0].data[index]);
                        }
                    }}
                />
            </div>
        </div>
    );
}

// Shared update logic for Entity (Car/Pedestrian)
function updateEntity(entity: Entity, mask: number[], width: number, height: number, isPedestrian = false) {
    const dx = entity.targetX - entity.x;
    const dy = entity.targetY - entity.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < entity.speed) {
        // Reached target, decide next move
        entity.x = entity.targetX;
        entity.y = entity.targetY;

        const gx = Math.floor(entity.x / ACTUAL_TILE_SIZE);
        const gy = Math.floor(entity.y / ACTUAL_TILE_SIZE);

        // Get current tile direction
        const currentTileDir = mask[gy * width + gx];

        let potentialMoves = [
            { dx: 0, dy: -1, dir: 1 }, // Up
            { dx: 1, dy: 0, dir: 2 },  // Right
            { dx: 0, dy: 1, dir: 3 },  // Down
            { dx: -1, dy: 0, dir: 4 }  // Left
        ];

        // Enforce direction for cars if on a directional tile
        if (!isPedestrian && currentTileDir >= 1 && currentTileDir <= 4) {
            potentialMoves = potentialMoves.filter(m => m.dir === currentTileDir);
        }

        const validNeighbors = potentialMoves.filter(move => {
            const nx = gx + move.dx;
            const ny = gy + move.dy;
            if (nx < 0 || nx >= width || ny < 0 || ny >= height) return false;
            return mask[ny * width + nx] > 0;
        });

        if (validNeighbors.length > 0) {
            let chosenMove;

            if (isPedestrian) {
                // Pedestrians wander randomly
                chosenMove = validNeighbors[Math.floor(Math.random() * validNeighbors.length)];
            } else {
                // Cars avoid U-turns and dead ends if possible
                if (entity.vx === 0 && entity.vy === 0) {
                    chosenMove = validNeighbors[Math.floor(Math.random() * validNeighbors.length)];
                } else {
                    const forwardMoves = validNeighbors.filter(move => {
                        const curDx = Math.sign(entity.vx);
                        const curDy = Math.sign(entity.vy);
                        return !(move.dx === -curDx && move.dy === -curDy);
                    });
                    if (forwardMoves.length > 0) {
                        chosenMove = forwardMoves[Math.floor(Math.random() * forwardMoves.length)];
                    } else {
                        chosenMove = validNeighbors[0];
                    }
                }
            }

            if (chosenMove) {
                const offset = isPedestrian ? (ACTUAL_TILE_SIZE * 0.4) : (ACTUAL_TILE_SIZE / 2);
                let jitterX = 0;
                let jitterY = 0;
                if (isPedestrian) {
                    jitterX = (Math.random() - 0.5) * (ACTUAL_TILE_SIZE * 0.5);
                    jitterY = (Math.random() - 0.5) * (ACTUAL_TILE_SIZE * 0.5);
                }

                entity.targetX = (gx + chosenMove.dx) * ACTUAL_TILE_SIZE + ACTUAL_TILE_SIZE / 2 + jitterX;
                entity.targetY = (gy + chosenMove.dy) * ACTUAL_TILE_SIZE + ACTUAL_TILE_SIZE / 2 + jitterY;
                entity.vx = chosenMove.dx;
                entity.vy = chosenMove.dy;
            }
        }
    } else {
        // Keep moving towards target
        entity.x += (dx / dist) * entity.speed;
        entity.y += (dy / dist) * entity.speed;
    }
}
