const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const statusDisplay = document.getElementById("statusDisplay");
const inventoryPanel = document.getElementById("inventoryPanel");

const GRID_SIZE = 8;
const TILE_SIZE = canvas.width / GRID_SIZE;

let gameState = {
    day: 1,
    money: 50, // Starting money
    activeTool: "hoe", 
    inventory: {
        CarrotSeed: 0,
        WheatSeed: 0
    },
    farm: []
};

const CROPS = {
    CarrotSeed: { name: "Carrot", stages: 3, value: 25 },
    WheatSeed: { name: "Wheat", stages: 4, value: 40 }
};

// Initialize the farm grid
function initializeFarm() {
    for (let x = 0; x < GRID_SIZE; x++) {
        gameState.farm[x] = [];
        for (let y = 0; y < GRID_SIZE; y++) {
            // type: 0=Grass, 1=Tilled, 2=Planted (cropType, watered, growthStage defined within object)
            gameState.farm[x][y] = { type: 0 }; 
        }
    }
}

// Drawing Functions
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let x = 0; x < GRID_SIZE; x++) {
        for (let y = 0; y < GRID_SIZE; y++) {
            const tile = gameState.farm[x][y];
            const posX = x * TILE_SIZE;
            const posY = y * TILE_SIZE;

            ctx.fillStyle = "#a0f0a0"; // Default grass
            if (tile.type === 1 || tile.type === 2) {
                // Soil color changes if watered
                ctx.fillStyle = tile.watered ? "#7b3f00" : "#9b713a"; 
            }
            ctx.fillRect(posX, posY, TILE_SIZE, TILE_SIZE);

            if (tile.type === 2) {
                drawCrop(posX, posY, tile.cropType, tile.growthStage);
            }
        }
    }
    updateUI();
}

function drawCrop(x, y, cropType, stage) {
    // Simple pixelated representation
    if (cropType === 'CarrotSeed') {
        ctx.fillStyle = stage === CROPS.CarrotSeed.stages ? "#FFA500" : "#006400"; // Orange if ripe
        ctx.fillRect(x + TILE_SIZE/2 - 2, y + TILE_SIZE - (stage * 3), 4, stage * 3);
    } else if (cropType === 'WheatSeed') {
        ctx.fillStyle = stage === CROPS.WheatSeed.stages ? "#FFD700" : "#DAF7A6"; // Gold if ripe
        ctx.fillRect(x + TILE_SIZE/2 - 4, y + TILE_SIZE - (stage * 2), 8, stage * 2);
    }
}

function selectSeedFromInventory(seedType) {
    if (gameState.inventory[seedType] > 0) {
        setActiveTool(seedType);
    }
}

function updateUI() {
    statusDisplay.textContent = `Day: ${gameState.day} | Money: $${gameState.money}`;
    
    // Clear and rebuild the inventory panel
    inventoryPanel.innerHTML = "Inventory: ";
    
    for (const seedType in gameState.inventory) {
        if (gameState.inventory[seedType] > 0) {
            const seedCount = gameState.inventory[seedType];
            const button = document.createElement('button');
            button.textContent = `${seedType} (${seedCount})`;
            button.className = 'inventory-item-button';
            // Use an anonymous function wrapper for the onclick handler
            button.onclick = () => selectSeedFromInventory(seedType); 
            button.setAttribute('data-seed-type', seedType);
            inventoryPanel.appendChild(button);
            // Add a separator for display
            inventoryPanel.appendChild(document.createTextNode(' | '));
        }
    }
    // Remove the last separator if present
    if (inventoryPanel.lastChild && inventoryPanel.lastChild.nodeType === 3 && inventoryPanel.lastChild.textContent === ' | ') {
        inventoryPanel.removeChild(inventoryPanel.lastChild);
    }
    
    // After updating UI elements, ensure the correct one is highlighted if it is the currently active tool
    if (gameState.activeTool.endsWith("Seed")) {
        // This will find the newly created button and highlight it
        const currentActiveInvButton = document.querySelector(`.inventory-item-button[data-seed-type="${gameState.activeTool}"]`);
        if (currentActiveInvButton) {
            currentActiveInvButton.classList.add('active');
        }
    }
}

function highlightShopButton(clickedButton) {
    // Remove 'active' class (which will be yellow background in CSS) from all shop buttons
    document.querySelectorAll(".shop-item-button").forEach(btn => {
        btn.classList.remove("active");
    });
    // Add 'active' class to the clicked button
    if (clickedButton) {
        clickedButton.classList.add("active");
    }
}

// User Interaction Handlers
canvas.addEventListener("click", function(event) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;

    const gridX = Math.floor(x / TILE_SIZE);
    const gridY = Math.floor(y / TILE_SIZE);

    if (gridX >= 0 && gridX < GRID_SIZE && gridY >= 0 && gridY < GRID_SIZE) {
        handleToolUse(gridX, gridY);
    }
});

function handleToolUse(x, y) {
    const tile = gameState.farm[x][y];

    switch (gameState.activeTool) {
        case "hoe":
            if (tile.type === 0) {
                tile.type = 1; // Till grass
            }
            break;
        case "water":
            if (tile.type === 1 || tile.type === 2) {
                tile.watered = true;
            }
            break;
        case "harvest":
            if (tile.type === 2 && tile.growthStage === CROPS[tile.cropType].stages) {
                gameState.money += CROPS[tile.cropType].value;
                gameState.farm[x][y] = { type: 0 }; // Reset tile to grass
            }
            break;
    }
    draw();
}

// Tool Selection UI
document.querySelectorAll(".tool-button").forEach(button => {
    button.addEventListener("click", () => {
        setActiveTool(button.getAttribute("data-tool"));
    });
});

function setActiveTool(toolName) {
    gameState.activeTool = toolName;
    
    // 1. Remove 'active' class from all tool buttons (Hoe, Water, Harvest)
    document.querySelectorAll(".tool-button").forEach(btn => {
        btn.classList.remove("active");
    });

    // 2. Highlight the active tool button if it exists (Hoe, Water, Harvest)
    const toolButton = document.getElementById(toolName + "Tool");
    if (toolButton) {
        toolButton.classList.add("active");
    }

    // 3. Manage highlighting for Shop/Inventory Seed buttons (clear all first)
    document.querySelectorAll(".shop-item-button, .inventory-item-button").forEach(btn => {
        btn.classList.remove("active");
    });
    
    // 4. Highlight the specific shop or inventory button if a seed is selected
    if (toolName.endsWith("Seed")) {
        // Try finding it in the shop first, then the inventory after UI updates
        // Since updateUI runs *after* this might be called during buy, we rely on updateUI to finalize the inventory highlight
    }
    
    // Update cursor style
    if (toolName === 'water' || toolName === 'harvest' || toolName === 'hoe') {
        canvas.style.cursor = 'pointer'; 
    } else {
        canvas.style.cursor = 'crosshair'; 
    }
    
    // Re-run updateUI to ensure correct inventory button highlighting on state change
    updateUI();
}


// Planting Interaction (handled differently to select seed type)
canvas.addEventListener("click", function(event) {
    if (gameState.activeTool.endsWith("Seed")) {
        // ... (coordinates logic repeated from above) ...
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (event.clientX - rect.left) * scaleX;
        const y = (event.clientY - rect.top) * scaleY;
        const gridX = Math.floor(x / TILE_SIZE);
        const gridY = Math.floor(y / TILE_SIZE);
        // ...
        
        const tile = gameState.farm[gridX][gridY];
        const selectedSeed = gameState.activeTool;

        if (tile.type === 1 && gameState.inventory[selectedSeed] > 0) {
            tile.type = 2;
            tile.cropType = selectedSeed;
            tile.growthStage = 1;
            tile.watered = true; 
            gameState.inventory[selectedSeed]--;
            draw();
        }
    }
});

// Day Cycle Logic
function nextDay() {
    gameState.day++;
    for (let x = 0; x < GRID_SIZE; x++) {
        for (let y = 0; y < GRID_SIZE; y++) {
            const tile = gameState.farm[x][y];
            if (tile.type === 2) {
                if (tile.watered) {
                    tile.growthStage++;
                    tile.watered = false; // Dry out for next day
                    if (tile.growthStage > CROPS[tile.cropType].stages) {
                        tile.growthStage = CROPS[tile.cropType].stages;
                    }
                } else {
                    // Optional: add death condition here for more complexity
                }
            }
        }
    }
    draw();
}

// Shop Logic
function buySeeds(seedType, cost, event) {
    if (gameState.money >= cost) {
        gameState.money -= cost;
        gameState.inventory[seedType]++;
        setActiveTool(seedType); // Automatically select bought seed for planting

        // Pass the event target to the highlighting function
        if (event && event.currentTarget) {
            highlightShopButton(event.currentTarget);
        }

        draw();
    } else {
        alert("Not enough money!");
    }
}

// Start the game
initializeFarm();
draw();
