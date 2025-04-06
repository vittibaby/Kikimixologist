class SlotMachine {
    constructor() {
        this.balance = 1000;
        this.bet = 10;
        this.symbols = ['🍒', '🍊', '🍇', '7️⃣', '💎'];
        this.payouts = {
            '🍒🍒🍒': 3,
            '🍊🍊🍊': 5,
            '🍇🍇🍇': 7,
            '7️⃣7️⃣7️⃣': 10,
            '💎💎💎': 20
        };
        this.isSpinning = false;
        this.spinSound = document.getElementById('spin-sound');
        this.winSound = document.getElementById('win-sound');

        this.initializeEventListeners();
    }

    initializeEventListeners() {
        document.getElementById('spin-button').addEventListener('click', () => this.spin());
        document.getElementById('increase-bet').addEventListener('click', () => this.changeBet(10));
        document.getElementById('decrease-bet').addEventListener('click', () => this.changeBet(-10));
    }

    changeBet(amount) {
        const newBet = this.bet + amount;
        if (newBet >= 10 && newBet <= this.balance) {
            this.bet = newBet;
            document.getElementById('bet').textContent = this.bet;
        }
    }

    async spin() {
        if (this.isSpinning || this.balance < this.bet) return;

        this.isSpinning = true;
        this.balance -= this.bet;
        document.getElementById('balance').textContent = this.balance;
        document.getElementById('spin-button').disabled = true;

        this.spinSound.currentTime = 0;
        this.spinSound.play();

        const reels = [
            document.getElementById('reel1'),
            document.getElementById('reel2'),
            document.getElementById('reel3')
        ];

        const results = [];
        for (let i = 0; i < 3; i++) {
            results.push(this.spinReel(reels[i]));
        }

        await Promise.all(results);
        
        const combination = reels.map(reel => 
            reel.querySelector('.symbol:nth-child(3)').textContent
        ).join('');

        this.checkWin(combination);
        this.isSpinning = false;
        document.getElementById('spin-button').disabled = false;
    }

    async spinReel(reel) {
        const spinDuration = 2000;
        const startTime = Date.now();
        const symbolHeight = 50;
        const totalSymbols = this.symbols.length;
        
        return new Promise(resolve => {
            const spin = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / spinDuration, 1);
                
                if (progress < 1) {
                    const offset = -Math.floor(progress * totalSymbols * symbolHeight);
                    reel.style.transform = `translateY(${offset}px)`;
                    requestAnimationFrame(spin);
                } else {
                    const randomIndex = Math.floor(Math.random() * this.symbols.length);
                    const finalOffset = -randomIndex * symbolHeight;
                    reel.style.transform = `translateY(${finalOffset}px)`;
                    resolve();
                }
            };
            
            spin();
        });
    }

    checkWin(combination) {
        const multiplier = this.payouts[combination] || 0;
        if (multiplier > 0) {
            const winnings = this.bet * multiplier;
            this.balance += winnings;
            document.getElementById('balance').textContent = this.balance;
            this.winSound.currentTime = 0;
            this.winSound.play();
            
            // Add winning animation
            const reels = document.querySelectorAll('.reel');
            reels.forEach(reel => {
                reel.classList.add('winning');
                setTimeout(() => reel.classList.remove('winning'), 1000);
            });
        }
    }
}

// Initialize the slot machine when the page loads
window.addEventListener('load', () => {
    new SlotMachine();
}); 