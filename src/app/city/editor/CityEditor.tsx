'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';

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
    const [paletteZoom, setPaletteZoom] = useState(2); // Start at 2x

    // Sidebar Resize State
    const [sidebarWidth, setSidebarWidth] = useState(380);
    const [isResizingSidebar, setIsResizingSidebar] = useState(false);

    const [entityConfigs, setEntityConfigs] = useState<EntityConfig[]>([]);

    const lastGridPosRef = useRef<{ x: number, y: number } | null>(null);
    const lastDirectionRef = useRef<number>(1); // Default UP

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
                    const defaults: EntityConfig[] = [
                        { id: 0, type: 'car', right: [0, 0], left: [0, 0], up: [0, 0], down: [0, 0] },
                        { id: 1, type: 'car', right: [0, 0], left: [0, 0], up: [0, 0], down: [0, 0] },
                        { id: 2, type: 'car', right: [0, 0], left: [0, 0], up: [0, 0], down: [0, 0] },
                        { id: 3, type: 'train', right: [0, 0, 0, 0], left: [0, 0, 0, 0], up: [0, 0, 0, 0], down: [0, 0, 0, 0] },
                    ];
                    setEntityConfigs(defaults);
                }
            })
            .catch(err => console.error('Failed to load level data:', err));
    }, []);

    useEffect(() => {
        if (levelData && entityConfigs.length > 0) {
            setLevelData(prev => prev ? ({ ...prev, entityConfigs }) : null);
        }
    }, [entityConfigs]);

    // Handle Sidebar Resize
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isResizingSidebar) {
                setSidebarWidth(Math.max(200, Math.min(800, e.clientX)));
            }
        };

        const handleMouseUp = () => {
            setIsResizingSidebar(false);
            document.body.style.cursor = 'default';
        };

        if (isResizingSidebar) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizingSidebar]);

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

    const onMouseMove = (e: React.MouseEvent) => {
        handleCanvasInteraction(e);
    };

    const onMouseUp = () => {
        setIsDrawing(false);
        setIsErasing(false);
        lastGridPosRef.current = null;
    };

    const onMouseLeave = () => {
        setIsDrawing(false);
        setIsErasing(false);
        lastGridPosRef.current = null;
        setHoverPos(null);
    };

    const onCanvasWheel = (e: React.WheelEvent) => {
        if (e.ctrlKey) return;
        const delta = e.deltaY > 0 ? -1 : 1;
        setBrushSize(prev => Math.max(1, Math.min(10, prev + delta)));
    };

    const setEntityTile = (configIdx: number, direction: 'right' | 'left' | 'up' | 'down', partIdx: number, tileId: number) => {
        const newConfigs = [...entityConfigs];
        const newParts = [...newConfigs[configIdx][direction]];
        newParts[partIdx] = tileId;
        newConfigs[configIdx] = { ...newConfigs[configIdx], [direction]: newParts };
        setEntityConfigs(newConfigs);
    };

    // Handle Palette Zoom specifically with non-passive listener to prevent browser zoom
    useEffect(() => {
        const palette = paletteRef.current?.parentElement; // Attach to the scrolling container
        if (!palette) return;

        const handleWheel = (e: WheelEvent) => {
            if (e.ctrlKey) {
                e.preventDefault();
                const delta = e.deltaY > 0 ? -0.5 : 0.5;
                setPaletteZoom(prev => Math.max(1, Math.min(8, prev + delta)));
            }
        };

        palette.addEventListener('wheel', handleWheel, { passive: false });
        return () => palette.removeEventListener('wheel', handleWheel);
    }, []);

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

    useEffect(() => {
        if (!levelData || !tilemap || !canvasRef.current || activeTool === 'entities') return;
        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;
        ctx.fillStyle = '#111';
        ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        ctx.imageSmoothingEnabled = false;

        if (showGrid) {
            ctx.strokeStyle = '#222';
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
        ctx.globalAlpha = 1.0;

        if (showOverlays) {
            if (activeTool === 'drivable') {
                for (let i = 0; i < levelData.drivable.length; i++) {
                    const dir = levelData.drivable[i];
                    if (dir) {
                        const x = (i % levelData.width) * ACTUAL_TILE_SIZE;
                        const y = Math.floor(i / levelData.width) * ACTUAL_TILE_SIZE;

                        // Colorize by direction
                        if (dir === 1) ctx.fillStyle = 'rgba(0, 255, 100, 0.4)'; // Up (Green)
                        else if (dir === 2) ctx.fillStyle = 'rgba(255, 165, 0, 0.4)'; // Right (Orange)
                        else if (dir === 3) ctx.fillStyle = 'rgba(0, 100, 255, 0.4)'; // Down (Blue)
                        else if (dir === 4) ctx.fillStyle = 'rgba(255, 0, 100, 0.4)'; // Left (Red)
                        else ctx.fillStyle = 'rgba(0, 255, 0, 0.4)'; // Default

                        ctx.fillRect(x, y, ACTUAL_TILE_SIZE, ACTUAL_TILE_SIZE);

                        // Small Arrow indicator
                        ctx.fillStyle = 'rgba(255,255,255,0.8)';
                        const cx = x + ACTUAL_TILE_SIZE / 2;
                        const cy = y + ACTUAL_TILE_SIZE / 2;
                        const size = 4;
                        ctx.beginPath();
                        if (dir === 1) { ctx.moveTo(cx, cy - size); ctx.lineTo(cx - size, cy + size); ctx.lineTo(cx + size, cy + size); } // Up
                        else if (dir === 2) { ctx.moveTo(cx + size, cy); ctx.lineTo(cx - size, cy - size); ctx.lineTo(cx - size, cy + size); } // Right
                        else if (dir === 3) { ctx.moveTo(cx, cy + size); ctx.lineTo(cx - size, cy - size); ctx.lineTo(cx + size, cy - size); } // Down
                        else if (dir === 4) { ctx.moveTo(cx - size, cy); ctx.lineTo(cx + size, cy - size); ctx.lineTo(cx + size, cy + size); } // Left
                        ctx.fill();
                    }
                }
            }
            if (activeTool === 'walkable') {
                ctx.fillStyle = 'rgba(0, 100, 255, 0.4)';
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
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.rect(cursorX, cursorY, cursorSize, cursorSize);
            ctx.stroke();
            ctx.strokeStyle = 'rgba(0,0,0,0.5)';
            ctx.lineWidth = 1;
            ctx.strokeRect(cursorX - 1, cursorY - 1, cursorSize + 2, cursorSize + 2);
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
            if (res.ok) alert('Level saved!');
            else alert('Failed to save.');
        } catch (err) {
            console.error(err);
        }
    };

    const renderTilePreview = (tileId: number) => {
        if (tileId <= 0) return <div className="w-8 h-8 flex items-center justify-center text-[10px] text-neutral-600">Empty</div>;
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
        <div className="min-h-screen bg-neutral-900 text-white flex flex-col h-screen overflow-hidden">
            <div className="bg-neutral-800 p-4 border-b border-neutral-700 flex justify-between items-center z-10 shadow-md">
                <div className="flex items-center gap-6">
                    <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-red-500">
                        City Editor
                    </h1>
                    <div className="flex bg-neutral-900 rounded-lg p-1 border border-neutral-700">
                        <button onClick={() => setActiveTool('paint')} className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${activeTool === 'paint' ? 'bg-orange-500 text-white' : 'text-neutral-400 hover:text-white'}`}>🖌️ Paint</button>
                        <button onClick={() => setActiveTool('drivable')} className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${activeTool === 'drivable' ? 'bg-green-600 text-white' : 'text-neutral-400 hover:text-white'}`}>🚗 Drivable</button>
                        <button onClick={() => setActiveTool('walkable')} className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${activeTool === 'walkable' ? 'bg-blue-600 text-white' : 'text-neutral-400 hover:text-white'}`}>🚶 Walkable</button>
                        <div className="w-px bg-neutral-700 mx-1"></div>
                        <button onClick={() => setActiveTool('entities')} className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${activeTool === 'entities' ? 'bg-indigo-600 text-white' : 'text-neutral-400 hover:text-white'}`}>📦 Entities</button>
                    </div>
                    {activeTool !== 'entities' && (
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1 text-sm bg-neutral-900 px-3 py-1 rounded">
                                <span className="text-neutral-500">Brush:</span>
                                <span className="font-mono text-orange-400 font-bold">{brushSize}</span>
                            </div>
                        </div>
                    )}
                    {activeTool === 'paint' && (
                        <div className="flex items-center gap-2 border-l border-neutral-700 pl-4">
                            <span className="text-xs text-neutral-500 uppercase tracking-wider">Layer:</span>
                            {levelData?.layers.map((l, idx) => (
                                <button key={idx} onClick={() => setActiveLayerIndex(idx)} className={`text-sm px-2 py-1 rounded ${activeLayerIndex === idx ? 'bg-neutral-600 text-white' : 'text-neutral-400'}`}>{l.name}</button>
                            ))}
                        </div>
                    )}
                </div>
                <div className="flex gap-3">
                    <button onClick={() => setShowGrid(!showGrid)} className="text-neutral-400 text-sm hover:text-white">Grid</button>
                    <button onClick={() => setShowOverlays(!showOverlays)} className="text-neutral-400 text-sm hover:text-white">Overlays</button>
                    <button onClick={handleSave} className="bg-emerald-600 text-white px-4 py-2 rounded font-bold hover:bg-emerald-500 transition shadow-lg">Save</button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar - Tilemap Palette - Resizable & Zoomable */}
                <div
                    className="bg-neutral-800 border-r border-neutral-700 flex flex-col flex-none relative group"
                    style={{ width: sidebarWidth }}
                >
                    <div className="p-3 border-b border-neutral-700 flex justify-between items-center">
                        <div className="text-xs font-bold text-neutral-500 uppercase">Palette (Ctrl+Scroll to Zoom)</div>
                        <div className="text-xs text-neutral-400">Scale: <span className="text-white font-mono">{paletteZoom}x</span></div>
                    </div>
                    <div className="flex-1 overflow-auto p-4 flex justify-center bg-neutral-900/50">
                        <div
                            ref={paletteRef}
                            className="relative cursor-crosshair shadow-lg flex-none"
                            onClick={handlePaletteClick}
                            style={{ width: TILEMAP_WIDTH * paletteZoom, height: TILEMAP_HEIGHT * paletteZoom }}
                        >
                            <div
                                style={{
                                    backgroundImage: `url(/city/tilemap_packed.png)`,
                                    backgroundSize: `${TILEMAP_WIDTH * paletteZoom}px ${TILEMAP_HEIGHT * paletteZoom}px`,
                                    width: '100%',
                                    height: '100%',
                                    imageRendering: 'pixelated'
                                }}
                            />
                            {(() => {
                                const sheetIndex = selectedTileId - 1;
                                if (sheetIndex >= 0) {
                                    const col = sheetIndex % TILEMAP_COLS;
                                    const row = Math.floor(sheetIndex / TILEMAP_COLS);
                                    return <div className="absolute border-2 border-red-500 pointer-events-none" style={{ left: col * TILE_SIZE * paletteZoom, top: row * TILE_SIZE * paletteZoom, width: TILE_SIZE * paletteZoom, height: TILE_SIZE * paletteZoom }} />;
                                }
                            })()}
                        </div>
                    </div>

                    {/* Drag Handle */}
                    <div
                        className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-orange-500 transition-colors z-20"
                        onMouseDown={() => {
                            setIsResizingSidebar(true);
                            document.body.style.cursor = 'col-resize';
                        }}
                    />
                </div>

                <div className="flex-1 overflow-auto bg-neutral-900 relative p-8 flex justify-center">
                    {activeTool === 'entities' ? (
                        <div className="w-full max-w-5xl">
                            <div className="bg-neutral-800 rounded-xl p-6 shadow-2xl border border-neutral-700">
                                <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
                                    <span>🚙</span> Entity Configuration
                                </h2>
                                <div className="space-y-6">
                                    {entityConfigs.map((entity, idx) => (
                                        <div key={idx} className="bg-neutral-900/50 p-4 rounded-lg border border-neutral-700">
                                            <div className="flex items-center gap-3 mb-3 border-b border-neutral-700 pb-2">
                                                <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${entity.type === 'train' ? 'bg-yellow-600' : 'bg-blue-600'}`}>
                                                    {idx + 1}
                                                </div>
                                                <span className="font-bold text-sm uppercase tracking-wider">{entity.type}</span>
                                            </div>

                                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                                {['right', 'left', 'up', 'down'].map((dir) => (
                                                    <div key={dir} className="flex flex-col gap-2">
                                                        <span className="text-xs text-neutral-500 uppercase font-semibold text-center">{dir}</span>
                                                        <div className="flex gap-1 justify-center">
                                                            {(entity[dir as keyof EntityConfig] as number[]).map((tileId, partIdx) => (
                                                                <div key={partIdx}
                                                                    className="w-10 h-10 bg-neutral-800 border border-neutral-600 rounded flex items-center justify-center hover:border-orange-500 cursor-pointer overflow-hidden relative group"
                                                                    onClick={() => setEntityTile(idx, dir as any, partIdx, selectedTileId)}
                                                                >
                                                                    {renderTilePreview(tileId)}
                                                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[8px] font-bold">SET</div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        levelData && (
                            <canvas
                                ref={canvasRef}
                                width={levelData.width * ACTUAL_TILE_SIZE}
                                height={levelData.height * ACTUAL_TILE_SIZE}
                                onMouseDown={onMouseDown}
                                onMouseMove={onMouseMove}
                                onMouseUp={onMouseUp}
                                onMouseLeave={onMouseLeave}
                                onContextMenu={(e) => e.preventDefault()}
                                onWheel={onCanvasWheel}
                                className="shadow-2xl border border-neutral-800 cursor-crosshair flex-none cursor-none block"
                            />
                        )
                    )}
                </div>
            </div>
        </div>
    );
}
