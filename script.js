const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Set initial canvas size
function resizeCanvas() {
    const isMobile = window.innerWidth <= 768;
    const maxWidth = isMobile ? window.innerWidth - 20 : 800;
    const maxHeight = isMobile ? window.innerHeight * 0.7 : 600;
    
    // Maintain aspect ratio
    const aspectRatio = 800 / 600;
    let width = maxWidth;
    let height = width / aspectRatio;
    
    if (height > maxHeight) {
        height = maxHeight;
        width = height * aspectRatio;
    }
    
    canvas.width = width;
    canvas.height = height;
}

// Initial resize
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Load images
const bubuImg = new Image();
const duduImg = new Image();
const friesImg = new Image();

bubuImg.src = 'bubu.png';
duduImg.src = 'dudu.png';
friesImg.src = 'fries.png';

// Wait for images to load
Promise.all([
    new Promise(resolve => bubuImg.onload = resolve),
    new Promise(resolve => duduImg.onload = resolve),
    new Promise(resolve => friesImg.onload = resolve)
]).then(() => {
    // Start animation after images are loaded
    animate();
});

// Horizontal line properties (only keeping lineY for slot machine positioning)
const lineY = canvas.height - 100;

// List of food emojis instead of faces
const foodEmojis = ['🍕', '🍔', '🍟', '🌭', '🍿', '🥨', '🥐', '🧁', '🍩', '🍪', '🍫', '🍬'];

// Button class
class Button {
    constructor(x, y, width, height, text) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.text = text;
        this.hover = false;
    }

    draw() {
        // Draw pill-shaped button background
        ctx.beginPath();
        const radius = this.height / 2;
        ctx.moveTo(this.x + radius, this.y);
        ctx.lineTo(this.x + this.width - radius, this.y);
        ctx.arc(this.x + this.width - radius, this.y + radius, radius, -Math.PI/2, Math.PI/2);
        ctx.lineTo(this.x + radius, this.y + this.height);
        ctx.arc(this.x + radius, this.y + radius, radius, Math.PI/2, -Math.PI/2);
        ctx.closePath();
        
        // Fill with the same blue color as slot machine
        ctx.fillStyle = this.hover ? '#7CDEDE' : '#66CCCC';
        ctx.fill();
        
        // Add a subtle border
        ctx.strokeStyle = '#5BBBBB';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw button text
        ctx.fillStyle = '#fff';
        ctx.font = `bold ${canvas.width * 0.03}px Arial`; // Responsive font size
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.text, this.x + this.width/2, this.y + this.height/2);
    }

    isPointInside(x, y) {
        return x >= this.x && x <= this.x + this.width &&
               y >= this.y && y <= this.y + this.height;
    }
}

// Add Heart class before the Food class
class Heart {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = -20; // Start above the canvas
        this.size = Math.random() * 20 + 15; // Random size between 15 and 35
        this.speedY = Math.random() * 1.5 + 0.5; // Changed to range from 0.5 to 2
        this.speedX = (Math.random() - 0.5) * 1.5; // Slight horizontal movement
        this.rotation = Math.random() * Math.PI * 2; // Random rotation
        this.rotationSpeed = (Math.random() - 0.5) * 0.1; // Rotation speed
        this.opacity = 1;
    }

    update() {
        this.y += this.speedY;
        this.x += this.speedX;
        this.rotation += this.rotationSpeed;
        // Fade out as it reaches the bottom
        if (this.y > canvas.height - 100) {
            this.opacity = Math.max(0, (canvas.height - this.y) / 100);
        }
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.font = `${this.size}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = `rgba(255, 182, 193, ${this.opacity})`; // Light pink with opacity
        ctx.fillText('💖', 0, 0); // Changed to sparkling heart
        ctx.restore();
    }
}

// Slot machine properties
class SlotMachine {
    constructor() {
        this.width = canvas.width * 0.5;  // Responsive width
        this.height = this.width * 0.9;   // Maintain aspect ratio
        this.x = canvas.width / 2;
        this.y = canvas.height - 20;
        this.symbols = ['bubu', 'dudu', 'fries', '❤️'];
        this.reels = [
            { symbols: [...this.symbols], position: 0, speed: 0 },
            { symbols: [...this.symbols], position: 0, speed: 0 },
            { symbols: [...this.symbols], position: 0, speed: 0 }
        ];
        this.spinning = false;
        this.spinTime = 0;
        this.maxSpinTime = 200;
        this.symbolHeight = 77;  // Reduced from 85 (10% smaller)
        this.visibleSymbols = 3;
        this.decelerationRate = 0.98;
        this.middlePosition = 115;  // Adjusted for new symbolHeight
        this.reelHeight = 230;  // Reduced from 255 (10% smaller)
        this.finalDecelerationRate = 0.95;
        this.isJackpot = false;
        this.jackpotStartTime = 0;
        this.jackpotDuration = 5000; // 5 seconds for blinking
        this.heartsStartTime = 0;
        this.heartsDuration = 10000; // Increased to 10 seconds for hearts animation
        this.hearts = [];
        this.isHeartsAnimating = false;
    }

    checkJackpot() {
        // Get the middle symbol of each reel
        const symbols = this.reels.map(reel => {
            const position = Math.floor(reel.position / this.symbolHeight) + 1; // Add 1 to get middle row
            return this.symbols[position % this.symbols.length];
        });
        
        // Check for specific winning sequences (both read left to right)
        const winningSequence1 = ['bubu', '❤️', 'dudu'];
        const winningSequence2 = ['dudu', '❤️', 'bubu'];
        
        this.isJackpot = (symbols.join(',') === winningSequence1.join(',')) || 
                        (symbols.join(',') === winningSequence2.join(','));
        
        if (this.isJackpot) {
            this.jackpotStartTime = Date.now();
            this.isHeartsAnimating = false;
        }
    }

    updateHearts() {
        const currentTime = Date.now();
        
        // Start hearts animation after jackpot blinking ends
        if (this.isJackpot && 
            currentTime - this.jackpotStartTime > this.jackpotDuration &&
            !this.isHeartsAnimating) {
            this.heartsStartTime = currentTime;
            this.isHeartsAnimating = true;
        }

        // During hearts animation
        if (this.isHeartsAnimating) {
            // Add new hearts with reduced spawn rate
            if (currentTime - this.heartsStartTime < this.heartsDuration) {
                if (Math.random() < 0.1) { // Reduced spawn rate from 0.2 to 0.1
                    this.hearts.push(new Heart());
                }
            }

            // Update existing hearts
            this.hearts = this.hearts.filter(heart => {
                // Only remove hearts that have faded out and fallen below canvas
                return heart.opacity > 0 && heart.y < canvas.height + 50;
            });
            this.hearts.forEach(heart => heart.update());

            // End animation after duration
            if (currentTime - this.heartsStartTime >= this.heartsDuration) {
                this.isHeartsAnimating = false;
                this.isJackpot = false;
                this.hearts = [];
            }
        }
    }

    draw() {
        // Calculate blinking for jackpot win
        const blinkVisible = this.isJackpot && (Date.now() - this.jackpotStartTime < this.jackpotDuration);
        const shouldShow = !blinkVisible || Math.floor((Date.now() - this.jackpotStartTime) / 200) % 2 === 0;
        
        // Draw machine body (retro pink base)
        ctx.fillStyle = '#FF9999';
        ctx.fillRect(this.x - this.width/2, this.y - this.height, this.width, this.height);
        
        // Draw rounded top
        ctx.beginPath();
        ctx.fillStyle = '#66CCCC';
        const arcRadius = this.width / 2;
        ctx.arc(this.x, this.y - this.height, arcRadius, Math.PI, 0);
        ctx.fill();
        
        // Draw heart emoji above JACKPOT
        ctx.font = '48px Arial';  // Back to original size
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('💖', this.x, this.y - this.height - 95);  // Moved higher up from -80 to -95

        // Draw "JACKPOT" text (blinking when won)
        if (shouldShow) {
            ctx.fillStyle = this.isJackpot ? '#FFD700' : '#000000'; // Gold color when winning
            ctx.font = 'bold 48px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('JACKPOT', this.x, this.y - this.height - 30);
        }
        
        // Draw dots around the arc (blinking when won)
        if (shouldShow) {
            ctx.fillStyle = this.isJackpot ? '#FFD700' : '#FF6B88'; // Gold color when winning
        const numDots = 20;
        for (let i = 0; i < numDots; i++) {
            const angle = Math.PI * (1 + i/(numDots-1));
            const dotX = this.x + (arcRadius + 8) * Math.cos(angle);
            const dotY = this.y - this.height + (arcRadius + 8) * Math.sin(angle);
            ctx.beginPath();
            ctx.arc(dotX, dotY, 4, 0, Math.PI * 2);
            ctx.fill();
            }
        }

        // Draw "MEGA WIN" text
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 36px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('MEGA WIN', this.x, this.y - this.height + 30);

        // Draw "Make Bubu and Dudu fall in love" text
        ctx.fillStyle = '#333';
        ctx.font = '20px Arial';
        ctx.fillText('Make Bubu and Dudu fall in love', this.x, this.y - this.height + 70);
        
        // Draw reels background with adjusted dimensions
        const reelWidth = 77;  // Reduced from 85 (10% smaller)
        const spacing = 15;
        const totalWidth = (reelWidth * 3) + (spacing * 2);
        const startX = this.x - totalWidth/2;
        const reelY = this.y - this.height + 95;
        const cornerRadius = 10;
        
        // Draw main display panel background
        ctx.fillStyle = '#FF9999';
        ctx.beginPath();
        ctx.roundRect(startX - 15, reelY - 15, totalWidth + 30, this.reelHeight + 30, 15);
        ctx.fill();
        
        // Draw decorative rectangular boxes around reels
        for (let i = 0; i < 3; i++) {
            const x = startX + (i * (reelWidth + spacing));
            
            // Draw outer box (darker pink)
            ctx.fillStyle = '#FF8080';
            ctx.beginPath();
            ctx.roundRect(x - 5, reelY - 5, reelWidth + 10, this.reelHeight + 10, cornerRadius + 2);
            ctx.fill();

            // Draw inner box (lighter pink)
            ctx.fillStyle = '#FFA3A3';
            ctx.beginPath();
            ctx.roundRect(x - 2, reelY - 2, reelWidth + 4, this.reelHeight + 4, cornerRadius + 1);
            ctx.fill();
            
            // Draw reels background
            ctx.fillStyle = '#FFCCCC';
            ctx.fillRect(x, reelY, reelWidth, this.reelHeight);

            // Set up clipping region for symbols
            ctx.save();
            const clipRegion = new Path2D();
            clipRegion.rect(x, reelY, reelWidth, this.reelHeight);
            ctx.clip(clipRegion);
            
            // Draw symbols in a wheel-like manner with adjusted font
            const symbolHeight = this.symbolHeight;
            ctx.font = '44px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // Draw symbols in a continuous loop
            for (let j = -1; j < this.visibleSymbols + 1; j++) {
                const symbolY = reelY + (j * symbolHeight) - (this.reels[i].position % symbolHeight);
                const symbolIndex = Math.floor((this.reels[i].position / symbolHeight + j) % this.symbols.length);
                const symbol = this.symbols[Math.abs(symbolIndex)];
                
                // Only draw symbols that are within the visible area
                if (symbolY >= reelY - symbolHeight && symbolY <= reelY + this.reelHeight) {
                    // Add symbol shadow
                    ctx.fillStyle = 'rgba(0,0,0,0.3)';
                    if (symbol === '❤️') {
                        ctx.font = '44px Arial';
                        ctx.fillText(symbol, x + reelWidth/2 + 2, symbolY + symbolHeight/2 + 2);
                    } else {
                        const img = symbol === 'bubu' ? bubuImg : symbol === 'dudu' ? duduImg : friesImg;
                        const imgSize = Math.min(reelWidth - 10, symbolHeight - 10); // Slightly smaller than reel width/height
                        ctx.drawImage(img, 
                            x + (reelWidth - imgSize)/2 + 2, 
                            symbolY + (symbolHeight - imgSize)/2 + 2, 
                            imgSize, 
                            imgSize
                        );
                    }

                    // Draw main symbol
                    if (symbol === '❤️') {
                        ctx.fillStyle = '#fff';
                        ctx.fillText(symbol, x + reelWidth/2, symbolY + symbolHeight/2);
                    } else {
                        const img = symbol === 'bubu' ? bubuImg : symbol === 'dudu' ? duduImg : friesImg;
                        const imgSize = Math.min(reelWidth - 10, symbolHeight - 10); // Slightly smaller than reel width/height
                        ctx.drawImage(img, 
                            x + (reelWidth - imgSize)/2, 
                            symbolY + (symbolHeight - imgSize)/2, 
                            imgSize, 
                            imgSize
                        );
                    }
                }
            }

            ctx.restore();
        }

        // Draw one large indicator box across all reels
        const totalReelWidth = (reelWidth * 3) + (spacing * 2);
        const middleBoxHeight = this.symbolHeight + 8;
        const middleBoxY = reelY + (this.reelHeight - middleBoxHeight) / 2 + 2; // Moved from +5 to +2 (higher)
        const boxStartX = startX - 5; // Moved left edge 5px left
        const boxWidth = totalReelWidth + 10; // Increased width by 10px

        // Add neon glow effect
        ctx.shadowColor = '#ffff00';  // Bright yellow
        ctx.shadowBlur = 20;          // Keep same blur for neon effect
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        // Draw outer frame with neon color
        ctx.strokeStyle = '#ffff00';  // Bright yellow
        ctx.lineWidth = 4;            // Thicker line
        ctx.beginPath();
        ctx.roundRect(boxStartX - 4, middleBoxY - 4, boxWidth + 8, middleBoxHeight + 8, 8);
        ctx.stroke();

        // Add second glow layer for stronger effect
        ctx.shadowColor = '#ffffa0';  // Lighter yellow
        ctx.shadowBlur = 10;
        
        // Draw inner frame with brighter neon color
        ctx.strokeStyle = '#ffffa0';  // Lighter yellow
        ctx.lineWidth = 3;            // Thicker line
        ctx.beginPath();
        ctx.roundRect(boxStartX - 2, middleBoxY - 2, boxWidth + 4, middleBoxHeight + 4, 6);
        ctx.stroke();

        // Reset shadow
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;

        // Draw lever with enhanced design and shading
        const leverX = this.x + this.width/2 + 30;
        const leverY = this.y - this.height + 80;
        const leverHeight = 120;
        const knobRadius = 22;
        
        // Draw lever base connector as a solid bar
        ctx.fillStyle = '#FF8080';
        ctx.beginPath();
        ctx.roundRect(leverX - 35, leverY - 10, 40, 25, 5);
        ctx.fill();

        // Add metallic shading to connector
        const connectorGradient = ctx.createLinearGradient(leverX - 35, leverY - 10, leverX - 35, leverY + 15);
        connectorGradient.addColorStop(0, '#FFA3A3');
        connectorGradient.addColorStop(0.5, '#FF8080');
        connectorGradient.addColorStop(1, '#FF6666');
        
        ctx.fillStyle = connectorGradient;
        ctx.beginPath();
        ctx.roundRect(leverX - 32, leverY - 8, 35, 20, 4);
        ctx.fill();

        // Add highlight to connector
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.beginPath();
        ctx.roundRect(leverX - 30, leverY - 8, 30, 8, 3);
        ctx.fill();

        // Draw lever arm with gradient shading
        const leverGradient = ctx.createLinearGradient(leverX, leverY, leverX + 20, leverY);
        leverGradient.addColorStop(0, '#FF9999');
        leverGradient.addColorStop(0.5, '#FF8080');
        leverGradient.addColorStop(1, '#FF6666');
        
        ctx.fillStyle = leverGradient;
        ctx.beginPath();
        ctx.roundRect(leverX - 2, leverY, 20, leverHeight, 5);
        ctx.fill();

        // Add shadow line on lever arm
        ctx.fillStyle = '#FF6666';
        ctx.beginPath();
        ctx.roundRect(leverX + 12, leverY, 6, leverHeight, 2);
        ctx.fill();

        // Draw lever knob with gradient
        const knobGradient = ctx.createRadialGradient(
            leverX + 8, leverY + leverHeight - 5,
            knobRadius * 0.2,
            leverX + 8, leverY + leverHeight - 5,
            knobRadius
        );
        knobGradient.addColorStop(0, '#FF9999');
        knobGradient.addColorStop(0.7, '#FF8080');
        knobGradient.addColorStop(1, '#FF6666');

        ctx.fillStyle = knobGradient;
        ctx.beginPath();
        ctx.arc(leverX + 8, leverY + leverHeight - 5, knobRadius, 0, Math.PI * 2);
        ctx.fill();

        // Add highlight to knob
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(leverX + 4, leverY + leverHeight - 9, knobRadius * 0.5, 0, Math.PI * 2);
        ctx.fill();

        // Draw falling hearts
        if (this.isHeartsAnimating) {
            this.hearts.forEach(heart => heart.draw());
        }

        // Check if jackpot animation should end
        if (this.isJackpot && 
            !this.isHeartsAnimating && 
            Date.now() - this.jackpotStartTime >= this.jackpotDuration) {
            this.isHeartsAnimating = true;
            this.heartsStartTime = Date.now();
        }
    }

    spin() {
        if (!this.spinning) {
            this.spinning = true;
            this.spinTime = 0;
            // Set random initial speeds for each reel
            this.reels.forEach((reel, i) => {
                reel.speed = Math.random() * 5 + 3; // Random speed between 3 and 8
                reel.slowDownTime = Math.floor(Math.random() * 100) + 50; // Random time between 50 and 150 frames
            });
        }
    }

    update() {
        if (this.spinning) {
            this.spinTime++;

            // Update each reel's position
            this.reels.forEach((reel, i) => {
                if (reel.speed > 0) { // Only update if reel is still spinning
                reel.position += reel.speed;
                    
                    // Gradually slow down each reel at random times
                    if (this.spinTime > reel.slowDownTime) {
                        // Use slower deceleration when close to stopping
                        const deceleration = reel.speed < 1 ? this.finalDecelerationRate : this.decelerationRate;
                        reel.speed *= deceleration;
                        
                        // Stop the reel when it's slow enough
                        if (reel.speed < 0.1) {
                            reel.speed = 0;
                            
                            // Find the symbol closest to the middle viewing position
                            const currentPosition = reel.position;
                            const remainder = currentPosition % this.symbolHeight;
                            
                            // If remainder is more than half symbol height, round up, otherwise round down
                            if (remainder > this.symbolHeight / 2) {
                                reel.position = currentPosition + (this.symbolHeight - remainder);
                            } else {
                                reel.position = currentPosition - remainder;
                            }
                        }
                    }
                }
            });

            // Check if all reels have stopped
            if (this.reels.every(reel => reel.speed === 0)) {
                this.spinning = false;
                this.checkJackpot(); // Check for jackpot when reels stop
            }
        }
        this.updateHearts();
    }
}

// Happy face properties (renamed to Food class)
class Food {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height; // Changed from (lineY - 50) to canvas.height
        this.radius = 25;  // Increased from 20 to 25 for larger emojis
        this.speedX = (Math.random() - 0.5) * 4;
        this.speedY = (Math.random() - 0.5) * 4;
        this.emoji = foodEmojis[Math.floor(Math.random() * foodEmojis.length)];
    }

    update() {
        // Update position
        this.x += this.speedX;
        this.y += this.speedY;

        // Bounce off walls
        if (this.x - this.radius < 0 || this.x + this.radius > canvas.width) {
            this.speedX = -this.speedX;
        }

        // Bounce off bottom
        if (this.y + this.radius > canvas.height) {
            this.y = canvas.height - this.radius;
            this.speedY = -this.speedY;
        }

        // Bounce off top
        if (this.y - this.radius < 0) {
            this.y = this.radius;
            this.speedY = -this.speedY;
        }
    }

    draw() {
        ctx.font = `${this.radius * 2}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.emoji, this.x, this.y);
    }
}

// Create multiple food emojis instead of faces
const foods = Array.from({ length: 15 }, () => new Food());
const slotMachine = new SlotMachine();
const spinButton = new Button(
    canvas.width / 2 - 75,  // Centered horizontally
    canvas.height - 40,      // Moved up from -30 to -40 (higher up)
    150,                     // Width
    40,                      // Height
    'SPIN'
);

// Animation loop
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update and draw foods
    foods.forEach(food => {
        food.update();
        food.draw();
    });

    // Update and draw slot machine
    slotMachine.update();
    slotMachine.draw();

    // Draw spin button
    spinButton.draw();

    requestAnimationFrame(animate);
}

// Add mouse event handlers
canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    spinButton.hover = spinButton.isPointInside(x, y);
});

canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Only allow spinning if not in jackpot animation
    if (spinButton.isPointInside(x, y) && !slotMachine.isJackpot && !slotMachine.isHeartsAnimating) {
        slotMachine.spin();
    }
});

// Start animation
animate(); 