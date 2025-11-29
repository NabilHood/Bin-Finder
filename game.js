const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const pointsDisplay = document.getElementById("pointsDisplay");

let points = 0;
// Represents the number of trunk/branch segments from the bottom up (starts with a base)
let treeHeight = 1; 
const costPerGrowth = 10;
const maxTreeHeight = 10;
const pixelSize = 8; // Each logical 'pixel' in our 128x128 canvas is 8 actual pixels in this game

// Game loop and drawing
function draw() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw ground line
    ctx.fillStyle = "#4a4";
    ctx.fillRect(0, canvas.height - pixelSize, canvas.width, pixelSize);

    // Draw tree trunk and branches based on treeHeight
    drawTreePixelated(canvas.width / 2, canvas.height - pixelSize, treeHeight);

    // Update UI display
    pointsDisplay.textContent = `Points: ${points}`;
}

// Function to draw a pixelated tree
function drawTreePixelated(startX, startY, height) {
    ctx.fillStyle = "#8b4513"; // Brown for trunk

    // Draw trunk segments (each is 1 pixel wide, pixelSize high)
    for (let i = 0; i < height; i++) {
        ctx.fillRect(startX - pixelSize / 2, startY - (i + 1) * pixelSize, pixelSize, pixelSize);
    }
    
    // Draw a simple green top if the tree has some height
    if (height > 0) {
        ctx.fillStyle = "#006400"; // Dark green
        // Simple pixelated leaves block at the top
        ctx.fillRect(startX - pixelSize * 1.5, startY - height * pixelSize - pixelSize * 2, pixelSize * 3, pixelSize * 3); 
        ctx.fillRect(startX - pixelSize, startY - height * pixelSize - pixelSize * 3, pixelSize * 2, pixelSize); 
    }
}

// User interactions
function collectPoints() {
    points += 1;
    draw();
}

function growTree() {
    if (points >= costPerGrowth && treeHeight < maxTreeHeight) {
        points -= costPerGrowth;
        treeHeight += 1;
        draw();
    } else if (treeHeight >= maxTreeHeight) {
        alert("Your tree has reached its maximum height!");
    } else {
        alert("Not enough points to grow the tree!");
    }
}

// Initial draw
draw();
