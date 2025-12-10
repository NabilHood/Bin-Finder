import React, { useState, useEffect, useRef, useCallback } from 'react';

// Define Constants and Configurations outside the component
const GRID_SIZE = 8;
const TILE_SIZE_LOGICAL = 16; // 128px / 8 grid size
const CANVAS_WIDTH = 128;
const CANVAS_HEIGHT = 128;
const COST_SEED_CARROT = 10;
const COST_SEED_WHEAT = 20;

const CROPS = {
    CarrotSeed: { name: "Carrot", stages: 3, value: 25 },
    WheatSeed: { name: "Wheat", stages: 4, value: 40 }
};

// Initial State Setup
const initializeFarm = () => {
    const farm = [];
    for (let x = 0; x < GRID_SIZE; x++) {
        farm[x] = [];
        for (let y = 0; y < GRID_SIZE; y++) {
            farm[x][y] = { type: 0 }; // 0: Grass
        }
    }
    return farm;
};

const FarmingSimulator = () => {
    // State Hooks for managing game data
    const [day, setDay] = useState(1);
    const [money, setMoney] = useState(50);
    const [activeTool, setActiveTool] = useState("hoe");
    const [inventory, setInventory] = useState({ CarrotSeed: 0, WheatSeed: 0 });
    // Farm state is a 2D array, which can be complex to manage immutably in React state
    const [farm, setFarm] = useState(initializeFarm()); 

    const canvasRef = useRef(null);

    // --- Drawing Logic (Encapsulated in a useCallback) ---

    // Simple pixelated crop drawing helper
    const drawCrop = useCallback((ctx, x, y, cropType, stage) => {
        if (cropType === 'CarrotSeed') {
            ctx.fillStyle = stage === CROPS.CarrotSeed.stages ? "#FFA500" : "#006400";
            ctx.fillRect(x + TILE_SIZE_LOGICAL/2 - 2, y + TILE_SIZE_LOGICAL - (stage * 3), 4, stage * 3);
        } else if (cropType === 'WheatSeed') {
            ctx.fillStyle = stage === CROPS.WheatSeed.stages ? "#FFD700" : "#DAF7A6";
            ctx.fillRect(x + TILE_SIZE_LOGICAL/2 - 4, y + TILE_SIZE_LOGICAL - (stage * 2), 8, stage * 2);
        }
    }, []);

    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        for (let x = 0; x < GRID_SIZE; x++) {
            for (let y = 0; y < GRID_SIZE; y++) {
                const tile = farm[x][y];
                const posX = x * TILE_SIZE_LOGICAL;
                const posY = y * TILE_SIZE_LOGICAL;

                ctx.fillStyle = "#a0f0a0"; // Default grass
                if (tile.type === 1 || tile.type === 2) {
                    ctx.fillStyle = tile.watered ? "#7b3f00" : "#9b713a"; 
                }
                ctx.fillRect(posX, posY, TILE_SIZE_LOGICAL, TILE_SIZE_LOGICAL);

                if (tile.type === 2) {
                    drawCrop(ctx, posX, posY, tile.cropType, tile.growthStage);
                }
            }
        }
    }, [farm, drawCrop]);

    // Update canvas whenever the farm state changes
    useEffect(() => {
        draw();
    }, [farm, draw]);

    // --- Interaction Logics ---

    const handleCanvasClick = useCallback((event) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (event.clientX - rect.left) * scaleX;
        const y = (event.clientY - rect.top) * scaleY;

        const gridX = Math.floor(x / TILE_SIZE_LOGICAL);
        const gridY = Math.floor(y / TILE_SIZE_LOGICAL);

        if (gridX >= 0 && gridX < GRID_SIZE && gridY >= 0 && gridY < GRID_SIZE) {
            handleToolUse(gridX, gridY);
        }
    }, [activeTool, money, inventory, farm]); // Depend on relevant states

    const handleToolUse = (x, y) => {
        // Use functional state updates for complex objects like farm to ensure consistency
        setFarm(prevFarm => {
            const newFarm = [...prevFarm];
            const tile = { ...newFarm[x][y] };

            switch (activeTool) {
                case "hoe":
                    if (tile.type === 0) tile.type = 1;
                    break;
                case "water":
                    if (tile.type >= 1 && tile.type <= 2) tile.watered = true;
                    break;
                case "harvest":
                    if (tile.type === 2 && tile.growthStage === CROPS[tile.cropType].stages) {
                        setMoney(m => m + CROPS[tile.cropType].value);
                        return prevFarm.map((row, rIdx) => 
                            rIdx === x ? row.map((col, cIdx) => 
                                cIdx === y ? { type: 0 } : col
                            ) : row
                        );
                    }
                    break;
                case "CarrotSeed":
                case "WheatSeed":
                    if (tile.type === 1 && inventory[activeTool] > 0) {
                        tile.type = 2;
                        tile.cropType = activeTool;
                        tile.growthStage = 1;
                        tile.watered = true;
                        setInventory(inv => ({ ...inv, [activeTool]: inv[activeTool] - 1 }));
                    } else if (inventory[activeTool] === 0) {
                        alert("Not enough seeds!");
                    }
                    break;
            }
            // Update the specific tile if modified
            newFarm[x][y] = tile;
            return newFarm;
        });
    };

    const nextDay = () => {
        setDay(d => d + 1);
        setFarm(prevFarm => prevFarm.map(row => 
            row.map(tile => {
                if (tile.type === 2) {
                    if (tile.watered) {
                        // Grow and reset water status
                        const newStage = Math.min(tile.growthStage + 1, CROPS[tile.cropType].stages);
                        return { ...tile, growthStage: newStage, watered: false };
                    }
                }
                return tile;
            })
        ));
    };

    const buySeeds = (seedType, cost) => {
        if (money >= cost) {
            setMoney(m => m - cost);
            setInventory(inv => ({ ...inv, [seedType]: inv[seedType] + 1 }));
            setActiveTool(seedType); // Select the bought seed immediately
        } else {
            alert("Not enough money!");
        }
    };

    const selectSeedFromInventory = (seedType) => {
        if (inventory[seedType] > 0) {
            setActiveTool(seedType);
        }
    };

    // --- Rendering JSX ---

    // CSS styles embedded as an object for a simple component file
    const styles = {
        container: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
        canvas: { 
            border: '4px solid #333', 
            width: '400px', 
            height: '400px', 
            cursor: activeTool.endsWith("Seed") ? 'crosshair' : 'pointer',
            imageRendering: 'pixelated'
        },
        uiPanel: { marginTop: '15px', textAlign: 'center', fontFamily: 'monospace' },
        controls: { display: 'flex', gap: '10px', marginBottom: '10px' },
        toolButton: { padding: '10px', fontSize: '14px', cursor: 'pointer', background: '#ddd', border: '2px solid #333' },
        activeButton: { background: '#ffeba4', borderColor: '#ffcc00' },
        shopPanel: { display: 'flex', gap: '10px', marginBottom: '10px' },
        shopButton: { padding: '10px', fontSize: '14px', cursor: 'pointer', background: '#ddd', border: '2px solid #333' },
        inventoryPanel: { display: 'flex', alignItems: 'center', flexWrap: 'wrap' },
        invItemButton: { padding: '5px 8px', fontSize: '14px', cursor: 'pointer', background: '#ddd', border: '1px solid #333', marginRight: '10px' }
    };

    return (
        <div style={styles.container}>
            <h1>Pixel Farming Simulator</h1>

            <div style={styles.uiPanel}>
                <div id="statusDisplay">Day: {day} | Money: ${money}</div>
                
                <div style={styles.controls}>
                    <button 
                        style={{...styles.toolButton, ...(activeTool === 'hoe' ? styles.activeButton : {})}}
                        onClick={() => setActiveTool("hoe")}
                    >Hoe</button>
                    <button 
                        style={{...styles.toolButton, ...(activeTool === 'water' ? styles.activeButton : {})}}
                        onClick={() => setActiveTool("water")}
                    >Water</button>
                    <button 
                        style={{...styles.toolButton, ...(activeTool === 'harvest' ? styles.activeButton : {})}}
                        onClick={() => setActiveTool("harvest")}
                    >Harvest</button>
                    <button onClick={nextDay}>Next Day</button>
                </div>

                <div style={styles.shopPanel}>
                    <button 
                        style={{...styles.shopButton, ...(activeTool === 'CarrotSeed' ? styles.activeButton : {})}}
                        onClick={(e) => buySeeds('CarrotSeed', COST_SEED_CARROT, e)}
                    >Buy Carrot Seeds (${COST_SEED_CARROT})</button>
                    <button 
                        style={{...styles.shopButton, ...(activeTool === 'WheatSeed' ? styles.activeButton : {})}}
                        onClick={(e) => buySeeds('WheatSeed', COST_SEED_WHEAT, e)}
                    >Buy Wheat Seeds (${COST_SEED_WHEAT})</button>
                </div>

                <div style={styles.inventoryPanel}>
                    Inventory: 
                    {Object.keys(inventory).map(seedType => inventory[seedType] > 0 && (
                        <button
                            key={seedType}
                            style={{...styles.invItemButton, ...(activeTool === seedType ? styles.activeButton : {})}}
                            onClick={() => selectSeedFromInventory(seedType)}
                        >
                            {seedType} ({inventory[seedType]})
                        </button>
                    ))}
                </div>
            </div>
            
            <canvas 
                ref={canvasRef}
                width={CANVAS_WIDTH} 
                height={CANVAS_HEIGHT}
                style={styles.canvas}
                onClick={handleCanvasClick}
            />
        </div>
    );
};

export default FarmingSimulator;
