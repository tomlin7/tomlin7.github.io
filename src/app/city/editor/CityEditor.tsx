'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
    Save, Grid, Layers, MousePointer, Car, Footprints,
    Box, Eraser, Minus, Plus, ChevronRight, ChevronLeft,
    Check, X, Eye, EyeOff
} from 'lucide-react';

const TILE_SIZE = 8;
const SCALE = 3;
const ACTUAL_TILE_SIZE = TILE_SIZE * SCALE;
const TILEMAP_COLS = 24;
const TILEMAP_ROWS = 15;
const TILEMAP_WIDTH = TILEMAP_COLS * TILE_SIZE;
const TILEMAP_HEIGHT = TILEMAP_ROWS * TILE_SIZE;

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

export default function CityEditor() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const paletteRef = useRef<HTMLDivElement>(null);
    const [levelData, setLevelData] = useState<LevelData | null>(null);
    const [tilemap, setTilemap] = useState<HTMLImageElement | null>(null);

    // Editor State
    const [selectedTileId, setSelectedTileId] = useState<number>(1);
    const [activeLayerIndex, setActiveLayerIndex] = useState<number>(0);
    const [activeTool, setActiveTool] = useState<'paint' | 'drivable' | 'walkable' | 'entities'>('paint');
    const [isDrawing, setIsDrawing] = useState(false);
    const [isErasing, setIsErasing] = useState(false);
    const [brushSize, setBrushSize] = useState(1);
    const [showGrid, setShowGrid] = useState(true);
    const [showOverlays, setShowOverlays] = useState(true);
    const [hoverPos, setHoverPos] = useState<{ x: number, y: number } | null>(null);

    // Palette Zoom State
    const [paletteZoom, setPaletteZoom] = useState(2);

    // Sidebar State
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const [entityConfigs, setEntityConfigs] = useState<EntityConfig[]>([]);

    const lastGridPosRef = useRef<{ x: number, y: number } | null>(null);
    const lastDirectionRef = useRef<number>(1);

    useEffect(() => {
        const img = new Image();
        img.src = '/city/tilemap_packed.png';
        img.onload = () => setTilemap(img);

        fetch('/city/data.json')
            .then(res => res.json())
            .then(data => {
                setLevelData(data);
                if (data.entityConfigs) {
                    setEntityConfigs(data.entityConfigs);
                } else {
                    setEntityConfigs([
                        { id: 0, type: 'car', right: [0, 0], left: [0, 0], up: [0, 0], down: [0, 0] },
                        { id: 1, type: 'car', right: [0, 0], left: [0, 0], up: [0, 0], down: [0, 0] },
                        { id: 2, type: 'car', right: [0, 0], left: [0, 0], up: [0, 0], down: [0, 0] },
                        { id: 3, type: 'train', right: [0, 0, 0, 0], left: [0, 0, 0, 0], up: [0, 0, 0, 0], down: [0, 0, 0, 0] },
                    ]);
                }
            })
            .catch(err => console.error('Failed to load level data:', err));
    }, []);

    useEffect(() => {
        if (levelData && entityConfigs.length > 0) {
            setLevelData(prev => prev ? ({ ...prev, entityConfigs }) : null);
        }
    }, [entityConfigs]);

    const paintTile = useCallback((cx: number, cy: number, erase: boolean, direction: number = 1) => {
        setLevelData(prev => {
            if (!prev) return null;
            const newData = { ...prev };
            let modified = false;
            const offset = Math.floor((brushSize - 1) / 2);
            for (let bx = 0; bx < brushSize; bx++) {
                for (let by = 0; by < brushSize; by++) {
                    const gx = cx - offset + bx;
                    const gy = cy - offset + by;
                    if (gx < 0 || gx >= prev.width || gy < 0 || gy >= prev.height) continue;
                    const index = gy * prev.width + gx;

                    if (activeTool === 'paint') {
                        const newLayers = [...(modified ? newData.layers : prev.layers)];
                        const activeLayer = { ...newLayers[activeLayerIndex] };
                        activeLayer.data = [...activeLayer.data];
                        const valueToSet = erase ? 0 : selectedTileId;
                        if (activeLayer.data[index] !== valueToSet) {
                            activeLayer.data[index] = valueToSet;
                            newLayers[activeLayerIndex] = activeLayer;
                            newData.layers = newLayers;
                            modified = true;
                        }
                    } else if (activeTool === 'drivable') {
                        const newDrivable = [...(modified ? newData.drivable : prev.drivable)];
                        const val = erase ? 0 : direction;
                        if (newDrivable[index] !== val) {
                            newDrivable[index] = val;
                            newData.drivable = newDrivable;
                            modified = true;
                        }
                    } else if (activeTool === 'walkable') {
                        const newWalkable = [...(modified ? newData.walkable : prev.walkable)];
                        const val = erase ? 0 : 1;
                        if (newWalkable[index] !== val) {
                            newWalkable[index] = val;
                            newData.walkable = newWalkable;
                            modified = true;
                        }
                    }
                }
            }
            return modified ? newData : prev;
        });
    }, [activeTool, activeLayerIndex, selectedTileId, brushSize]);

    const interpolateLine = useCallback((x0: number, y0: number, x1: number, y1: number, erase: boolean, direction: number = 1) => {
        const dx = Math.abs(x1 - x0);
        const dy = Math.abs(y1 - y0);
        const sx = (x0 < x1) ? 1 : -1;
        const sy = (y0 < y1) ? 1 : -1;
        let err = dx - dy;
        while (true) {
            paintTile(x0, y0, erase, direction);
            if ((x0 === x1) && (y0 === y1)) break;
            const e2 = 2 * err;
            if (e2 > -dy) { err -= dy; x0 += sx; }
            if (e2 < dx) { err += dx; y0 += sy; }
        }
    }, [paintTile]);

    const handleCanvasInteraction = useCallback((e: React.MouseEvent) => {
        if (!levelData || !canvasRef.current || activeTool === 'entities') return;
        const isRightClick = e.buttons === 2 || (e.type === 'mousedown' && e.button === 2) || isErasing;
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const scaleX = canvasRef.current.width / rect.width;
        const scaleY = canvasRef.current.height / rect.height;
        const gx = Math.floor((x * scaleX) / ACTUAL_TILE_SIZE);
        const gy = Math.floor((y * scaleY) / ACTUAL_TILE_SIZE);

        if (hoverPos?.x !== gx || hoverPos?.y !== gy) {
            setHoverPos({ x: gx, y: gy });
        }

        if (gx < 0 || gx >= levelData.width || gy < 0 || gy >= levelData.height) return;

        let direction = lastDirectionRef.current;
        if (isDrawing && lastGridPosRef.current) {
            const dx = gx - lastGridPosRef.current.x;
            const dy = gy - lastGridPosRef.current.y;
            if (dx !== 0 || dy !== 0) {
                if (Math.abs(dx) > Math.abs(dy)) {
                    direction = dx > 0 ? 2 : 4; // Right : Left
                } else {
                    direction = dy > 0 ? 3 : 1; // Down : Up
                }
                lastDirectionRef.current = direction;
            }
            interpolateLine(lastGridPosRef.current.x, lastGridPosRef.current.y, gx, gy, isRightClick, direction);
        } else if (e.type === 'mousedown' || isDrawing) {
            paintTile(gx, gy, isRightClick, direction);
        }
        if (isDrawing) {
            lastGridPosRef.current = { x: gx, y: gy };
        }
    }, [levelData, isDrawing, isErasing, paintTile, interpolateLine, hoverPos, activeTool]);

    const onMouseDown = (e: React.MouseEvent) => {
        if (activeTool === 'entities') return;
        if (e.button !== 0 && e.button !== 2) return;
        setIsDrawing(true);
        setIsErasing(e.button === 2);
        lastGridPosRef.current = null;
        handleCanvasInteraction(e);
    };

    const setEntityTile = (configIdx: number, direction: 'right' | 'left' | 'up' | 'down', partIdx: number, tileId: number) => {
        const newConfigs = [...entityConfigs];
        const newParts = [...newConfigs[configIdx][direction]];
        newParts[partIdx] = tileId;
        newConfigs[configIdx] = { ...newConfigs[configIdx], [direction]: newParts };
        setEntityConfigs(newConfigs);
    };

    const handlePaletteClick = (e: React.MouseEvent) => {
        if (!paletteRef.current) return;
        const rect = paletteRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const col = Math.floor(x / (TILE_SIZE * paletteZoom));
        const row = Math.floor(y / (TILE_SIZE * paletteZoom));

        if (col >= 0 && col < TILEMAP_COLS && row >= 0 && row < TILEMAP_ROWS) {
            const id = row * TILEMAP_COLS + col + 1;
            setSelectedTileId(id);
        }
    };

    // Canvas Rendering
    useEffect(() => {
        if (!levelData || !tilemap || !canvasRef.current || activeTool === 'entities') return;
        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;

        ctx.fillStyle = '#101012'; // Zinc-950-ish
        ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        ctx.imageSmoothingEnabled = false;

        if (showGrid) {
            ctx.strokeStyle = '#1f1f22'; // Zinc-900
            ctx.lineWidth = 1;
            ctx.beginPath();
            for (let x = 0; x <= levelData.width; x++) {
                ctx.moveTo(x * ACTUAL_TILE_SIZE, 0);
                ctx.lineTo(x * ACTUAL_TILE_SIZE, levelData.height * ACTUAL_TILE_SIZE);
            }
            for (let y = 0; y <= levelData.height; y++) {
                ctx.moveTo(0, y * ACTUAL_TILE_SIZE);
                ctx.lineTo(levelData.width * ACTUAL_TILE_SIZE, y * ACTUAL_TILE_SIZE);
            }
            ctx.stroke();
        }

        levelData.layers.forEach((layer) => {
            for (let i = 0; i < layer.data.length; i++) {
                const tileId = layer.data[i];
                if (tileId === 0) continue;
                const x = (i % levelData.width) * ACTUAL_TILE_SIZE;
                const y = Math.floor(i / levelData.width) * ACTUAL_TILE_SIZE;
                const sheetIndex = tileId - 1;
                const sx = (sheetIndex % TILEMAP_COLS) * TILE_SIZE;
                const sy = Math.floor(sheetIndex / TILEMAP_COLS) * TILE_SIZE;
                ctx.drawImage(tilemap, sx, sy, TILE_SIZE, TILE_SIZE, x, y, ACTUAL_TILE_SIZE, ACTUAL_TILE_SIZE);
            }
        });

        if (showOverlays) {
            if (activeTool === 'drivable') {
                for (let i = 0; i < levelData.drivable.length; i++) {
                    const dir = levelData.drivable[i];
                    if (dir) {
                        const x = (i % levelData.width) * ACTUAL_TILE_SIZE;
                        const y = Math.floor(i / levelData.width) * ACTUAL_TILE_SIZE;

                        ctx.fillStyle = dir === 1 || dir === 3 ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.15)';
                        ctx.fillRect(x, y, ACTUAL_TILE_SIZE, ACTUAL_TILE_SIZE);

                        // Arrow
                        ctx.fillStyle = 'rgba(255,255,255,0.7)';
                        const cx = x + ACTUAL_TILE_SIZE / 2;
                        const cy = y + ACTUAL_TILE_SIZE / 2;
                        const size = 3;
                        ctx.beginPath();
                        if (dir === 1) { ctx.moveTo(cx, cy - size); ctx.lineTo(cx - size, cy + size); ctx.lineTo(cx + size, cy + size); }
                        else if (dir === 2) { ctx.moveTo(cx + size, cy); ctx.lineTo(cx - size, cy - size); ctx.lineTo(cx - size, cy + size); }
                        else if (dir === 3) { ctx.moveTo(cx, cy + size); ctx.lineTo(cx - size, cy - size); ctx.lineTo(cx + size, cy - size); }
                        else if (dir === 4) { ctx.moveTo(cx - size, cy); ctx.lineTo(cx + size, cy - size); ctx.lineTo(cx + size, cy + size); }
                        ctx.fill();
                    }
                }
            }
            if (activeTool === 'walkable') {
                ctx.fillStyle = 'rgba(100, 200, 255, 0.15)';
                for (let i = 0; i < levelData.walkable.length; i++) {
                    if (levelData.walkable[i]) {
                        const x = (i % levelData.width) * ACTUAL_TILE_SIZE;
                        const y = Math.floor(i / levelData.width) * ACTUAL_TILE_SIZE;
                        ctx.fillRect(x + 2, y + 2, ACTUAL_TILE_SIZE - 4, ACTUAL_TILE_SIZE - 4);
                    }
                }
            }
        }

        if (hoverPos) {
            const offset = Math.floor((brushSize - 1) / 2);
            const cursorX = (hoverPos.x - offset) * ACTUAL_TILE_SIZE;
            const cursorY = (hoverPos.y - offset) * ACTUAL_TILE_SIZE;
            const cursorSize = brushSize * ACTUAL_TILE_SIZE;
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 1;
            ctx.strokeRect(cursorX, cursorY, cursorSize, cursorSize);
        }
    }, [levelData, tilemap, activeTool, showGrid, showOverlays, activeLayerIndex, hoverPos, brushSize]);

    const handleSave = async () => {
        if (!levelData) return;
        try {
            const res = await fetch('/api/city/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(levelData)
            });
            if (res.ok) alert('Saved');
        } catch (err) { console.error(err); }
    };

    const renderTilePreview = (tileId: number) => {
        if (tileId <= 0) return <div className="text-[9px] text-zinc-600">NULL</div>;
        const sheetIndex = tileId - 1;
        const sx = (sheetIndex % TILEMAP_COLS) * TILE_SIZE;
        const sy = Math.floor(sheetIndex / TILEMAP_COLS) * TILE_SIZE;
        return (
            <div style={{
                backgroundImage: `url(/city/tilemap_packed.png)`,
                backgroundPosition: `-${sx * 4}px -${sy * 4}px`,
                backgroundSize: `${TILEMAP_COLS * TILE_SIZE * 4}px auto`,
                width: 32, height: 32, imageRendering: 'pixelated'
            }} />
        );
    };

    return (
        <div className="h-screen w-screen bg-zinc-950 text-zinc-400 font-sans flex overflow-hidden">

            {/* --- Left Sidebar (Palette) --- */}
            <div className={`
                flex-none bg-zinc-950 border-r border-zinc-900 transition-all duration-300 relative
                ${isSidebarOpen ? 'w-80' : 'w-0'}
            `}>
                <div className="h-full flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-zinc-900 flex justify-between items-center bg-zinc-950/50 backdrop-blur">
                        <span className="text-xs font-mono uppercase tracking-widest text-zinc-500">Palette</span>
                        <div className="flex gap-1">
                            <button onClick={() => setPaletteZoom(z => Math.max(1, z - 1))} className="p-1 hover:text-white"><Minus size={14} /></button>
                            <span className="text-xs font-mono min-w-[20px] text-center">{paletteZoom}x</span>
                            <button onClick={() => setPaletteZoom(z => Math.min(8, z + 1))} className="p-1 hover:text-white"><Plus size={14} /></button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-auto p-4 content-center bg-[#08080a]">
                        <div
                            ref={paletteRef}
                            className="relative cursor-crosshair mx-auto shadow-2xl shadow-black ring-1 ring-zinc-800"
                            onClick={handlePaletteClick}
                            style={{ width: TILEMAP_WIDTH * paletteZoom, height: TILEMAP_HEIGHT * paletteZoom }}
                        >
                            <div
                                style={{
                                    backgroundImage: `url(/city/tilemap_packed.png)`,
                                    backgroundSize: `${TILEMAP_WIDTH * paletteZoom}px ${TILEMAP_HEIGHT * paletteZoom}px`,
                                    width: '100%', height: '100%',
                                    imageRendering: 'pixelated'
                                }}
                            />
                            {/* Selection Highlight */}
                            {(() => {
                                const sheetIndex = selectedTileId - 1;
                                if (sheetIndex >= 0) {
                                    const col = sheetIndex % TILEMAP_COLS;
                                    const row = Math.floor(sheetIndex / TILEMAP_COLS);
                                    return <div className="absolute ring-1 ring-white/50" style={{ left: col * TILE_SIZE * paletteZoom, top: row * TILE_SIZE * paletteZoom, width: TILE_SIZE * paletteZoom, height: TILE_SIZE * paletteZoom }} />;
                                }
                            })()}
                        </div>
                    </div>
                </div>
            </div>

            {/* --- Toggle Sidebar Button --- */}
            <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className={`absolute bottom-4 z-50 p-2 bg-zinc-900/90 border border-zinc-800 text-zinc-400 hover:text-white rounded-r-lg transition-all duration-300 ${isSidebarOpen ? 'left-80' : 'left-0'}`}
            >
                {isSidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            </button>


            {/* --- Main Content --- */}
            <div className="flex-1 relative flex flex-col bg-[#050505]">

                {/* Top Center: Tools HUD */}
                <div className="absolute top-6 left-1/2 -translate-x-1/2 z-40 bg-zinc-900/90 backdrop-blur-md border border-zinc-800/50 rounded-full px-2 py-1.5 flex gap-1 shadow-2xl">
                    {[
                        { id: 'paint', icon: MousePointer, label: 'Paint' },
                        { id: 'drivable', icon: Car, label: 'Roads' },
                        { id: 'walkable', icon: Footprints, label: 'Walk' },
                        { id: 'entities', icon: Box, label: 'Entities' },
                    ].map(tool => (
                        <button
                            key={tool.id}
                            onClick={() => setActiveTool(tool.id as any)}
                            className={`p-2 rounded-full transition-all group relative ${activeTool === tool.id ? 'bg-zinc-100 text-black' : 'hover:bg-zinc-800 text-zinc-500 hover:text-white'}`}
                        >
                            <tool.icon size={18} />
                            {/* Tooltip */}
                            <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 text-[10px] bg-zinc-800 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none">
                                {tool.label}
                            </span>
                        </button>
                    ))}

                    {/* Divider */}
                    <div className="w-px h-8 bg-zinc-800 mx-1 self-center" />

                    {/* Active Tool Settings */}
                    {activeTool !== 'entities' && (
                        <div className="flex items-center gap-2 pl-1 pr-2">
                            <span className="text-[10px] font-mono uppercase text-zinc-600">Size</span>
                            <div className="flex items-center gap-1 bg-zinc-800 rounded px-1">
                                <button onClick={() => setBrushSize(b => Math.max(1, b - 1))} className="p-1 hover:text-white"><Minus size={12} /></button>
                                <span className="text-xs font-mono w-4 text-center">{brushSize}</span>
                                <button onClick={() => setBrushSize(b => Math.min(10, b + 1))} className="p-1 hover:text-white"><Plus size={12} /></button>
                            </div>
                        </div>
                    )}
                </div>


                {/* Top Right: Global Actions */}
                <div className="absolute top-6 right-6 z-40 flex gap-2">
                    <button onClick={() => setShowGrid(!showGrid)} className={`p-2 rounded-lg border border-zinc-800 transition ${showGrid ? 'bg-zinc-800 text-white' : 'bg-zinc-900/50 text-zinc-500 hover:text-white'}`}>
                        <Grid size={18} />
                    </button>
                    <button onClick={() => setShowOverlays(!showOverlays)} className={`p-2 rounded-lg border border-zinc-800 transition ${showOverlays ? 'bg-zinc-800 text-white' : 'bg-zinc-900/50 text-zinc-500 hover:text-white'}`}>
                        <Eye size={18} />
                    </button>
                    <div className="w-px h-full bg-zinc-800 mx-1" />
                    <button onClick={handleSave} className="p-2 rounded-lg bg-zinc-100 text-black border border-white hover:bg-white transition flex items-center gap-2 font-medium text-sm px-4">
                        <Save size={16} /> Save
                    </button>
                </div>


                {/* Bottom Left: Layer Selector (Only for Paint) */}
                {activeTool === 'paint' && (
                    <div className="absolute bottom-6 left-6 z-30 bg-zinc-900/90 backdrop-blur border border-zinc-800 rounded-lg overflow-hidden flex flex-col shadow-2xl">
                        <div className="px-3 py-2 border-b border-zinc-800 bg-zinc-800/50 text-[10px] uppercase font-bold text-zinc-500 flex items-center gap-2">
                            <Layers size={12} /> Layers
                        </div>
                        <div className="flex flex-col p-1">
                            {levelData?.layers.map((l, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveLayerIndex(idx)}
                                    className={`px-3 py-2 text-left text-xs font-mono transition rounded ${activeLayerIndex === idx ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                                >
                                    {idx + 1}. {l.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}


                {/* --- Content Area --- */}
                <div className="flex-1 overflow-auto flex items-center justify-center p-8">
                    {activeTool === 'entities' ? (
                        <div className="w-full max-w-4xl bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-2xl p-8 shadow-2xl">
                            <div className="flex justify-between items-end mb-8 border-b border-zinc-800 pb-4">
                                <h2 className="text-xl font-medium text-white flex items-center gap-2"><Box size={20} /> Entity Configuration</h2>
                                <p className="text-xs text-zinc-500">Configure vehicle sprite sequences</p>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                {entityConfigs.map((entity, idx) => (
                                    <div key={idx} className="bg-black/20 rounded-lg p-4 border border-zinc-800/50 hover:border-zinc-700 transition">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="w-6 h-6 rounded bg-zinc-800 flex items-center justify-center text-xs font-mono text-white">{idx}</div>
                                            <div className="text-sm font-bold text-zinc-300 uppercase tracking-wider">{entity.type}</div>
                                        </div>

                                        <div className="grid grid-cols-4 gap-4">
                                            {['up', 'right', 'down', 'left'].map((dir) => (
                                                <div key={dir} className="flex flex-col gap-2">
                                                    <span className="text-[10px] text-zinc-600 uppercase font-bold text-center">{dir}</span>
                                                    <div className="flex gap-1 justify-center bg-zinc-900/50 p-2 rounded">
                                                        {(entity[dir as keyof EntityConfig] as number[]).map((tileId, partIdx) => (
                                                            <button
                                                                key={partIdx}
                                                                onClick={() => setEntityTile(idx, dir as any, partIdx, selectedTileId)}
                                                                className="w-8 h-8 bg-zinc-950 border border-zinc-800 hover:border-white transition relative group overflow-hidden"
                                                            >
                                                                <div className="absolute inset-0 flex items-center justify-center">
                                                                    {renderTilePreview(tileId)}
                                                                </div>
                                                                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition" />
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        levelData && (
                            <div className="relative shadow-2xl shadow-black ring-1 ring-zinc-800">
                                <canvas
                                    ref={canvasRef}
                                    width={levelData.width * ACTUAL_TILE_SIZE}
                                    height={levelData.height * ACTUAL_TILE_SIZE}
                                    onMouseDown={onMouseDown}
                                    onMouseMove={(e) => {
                                        if (isDrawing) handleCanvasInteraction(e);
                                        else {
                                            // Just update hover
                                            const rect = canvasRef.current!.getBoundingClientRect();
                                            const scaleX = canvasRef.current!.width / rect.width;
                                            const scaleY = canvasRef.current!.height / rect.height;
                                            const gx = Math.floor(((e.clientX - rect.left) * scaleX) / ACTUAL_TILE_SIZE);
                                            const gy = Math.floor(((e.clientY - rect.top) * scaleY) / ACTUAL_TILE_SIZE);
                                            setHoverPos({ x: gx, y: gy });
                                        }
                                    }}
                                    onMouseUp={() => { setIsDrawing(false); setIsErasing(false); lastGridPosRef.current = null; }}
                                    onMouseLeave={() => { setIsDrawing(false); setIsErasing(false); setHoverPos(null); }}
                                    onContextMenu={(e) => e.preventDefault()}
                                    className="block cursor-none bg-zinc-950"
                                />
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}
