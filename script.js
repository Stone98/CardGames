class SolitaireGame {
    constructor() {
        this.deck = [];
        this.stock = [];
        this.waste = [];
        this.foundations = [[], [], [], []]; // Hearts, Diamonds, Clubs, Spades
        this.tableau = [[], [], [], [], [], [], []];
        this.score = 0;
        this.moves = 0;
        this.selectedCard = null;
        this.selectedPile = null;
        this.autoPlayInterval = null;
        this.isAutoPlaying = false;
        this.loseCountdownInterval = null;
        this.lastAutoMoves = []; // Track recent auto-play moves
        this.stockCycles = 0; // Track how many times we've cycled through stock
        
        this.suits = ['hearts', 'diamonds', 'clubs', 'spades'];
        this.ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        this.suitSymbols = {
            'hearts': '♥',
            'diamonds': '♦',
            'clubs': '♣',
            'spades': '♠'
        };
        
        this.initializeGame();
        this.setupEventListeners();
    }
    
    initializeGame() {
        this.createDeck();
        this.shuffleDeck();
        this.dealCards();
        this.renderGame();
        this.updateScore();
    }
    
    createDeck() {
        this.deck = [];
        for (let suit of this.suits) {
            for (let i = 0; i < this.ranks.length; i++) {
                this.deck.push({
                    suit: suit,
                    rank: this.ranks[i],
                    value: i + 1,
                    color: (suit === 'hearts' || suit === 'diamonds') ? 'red' : 'black',
                    faceUp: false,
                    id: `${suit}-${this.ranks[i]}`
                });
            }
        }
    }
    
    shuffleDeck() {
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
    }
    
    dealCards() {
        // Reset all piles
        this.stock = [...this.deck];
        this.waste = [];
        this.foundations = [[], [], [], []];
        this.tableau = [[], [], [], [], [], [], []];
        
        // Deal to tableau
        for (let col = 0; col < 7; col++) {
            for (let row = 0; row <= col; row++) {
                const card = this.stock.pop();
                if (row === col) {
                    card.faceUp = true;
                }
                this.tableau[col].push(card);
            }
        }
    }
    
    setupEventListeners() {
        // New game button
        document.getElementById('new-game-btn').addEventListener('click', () => {
            this.newGame();
        });
        
        // Auto play button
        document.getElementById('auto-play-btn').addEventListener('click', () => {
            this.toggleAutoPlay();
        });
        
        // Play again button
        document.getElementById('play-again-btn').addEventListener('click', () => {
            this.hideWinMessage();
            this.newGame();
        });
        
        // Rules panel toggle
        document.getElementById('toggle-rules').addEventListener('click', () => {
            this.toggleRules();
        });
        
        // Stock pile click
        document.getElementById('stock-pile').addEventListener('click', () => {
            this.dealFromStock();
        });
        
        // Set up drag and drop for piles
        this.setupDragAndDrop();
    }
    
    setupDragAndDrop() {
        // Add event listeners to all piles
        const piles = document.querySelectorAll('.pile');
        piles.forEach(pile => {
            pile.addEventListener('dragover', this.handleDragOver.bind(this));
            pile.addEventListener('drop', this.handleDrop.bind(this));
            pile.addEventListener('dragleave', this.handleDragLeave.bind(this));
        });
    }
    
    renderGame() {
        this.renderStock();
        this.renderWaste();
        this.renderFoundations();
        this.renderTableau();
    }
    
    renderStock() {
        const stockPile = document.getElementById('stock-pile');
        stockPile.innerHTML = '';
        
        if (this.stock.length > 0) {
            const cardElement = this.createCardElement(this.stock[this.stock.length - 1], false);
            cardElement.style.position = 'relative';
            stockPile.appendChild(cardElement);
        } else {
            stockPile.innerHTML = '<div class="card-placeholder">↻</div>';
        }
    }
    
    renderWaste() {
        const wastePile = document.getElementById('waste-pile');
        wastePile.innerHTML = '';
        
        if (this.waste.length > 0) {
            const card = this.waste[this.waste.length - 1];
            const cardElement = this.createCardElement(card, true);
            cardElement.style.position = 'relative';
            cardElement.addEventListener('click', () => this.selectCard(card, 'waste'));
            this.setupCardDrag(cardElement, card, 'waste');
            wastePile.appendChild(cardElement);
        } else {
            wastePile.innerHTML = '<div class="card-placeholder">Waste</div>';
        }
    }
    
    renderFoundations() {
        for (let i = 0; i < 4; i++) {
            const foundationPile = document.getElementById(`foundation-${i}`);
            foundationPile.innerHTML = '';
            
            if (this.foundations[i].length > 0) {
                const card = this.foundations[i][this.foundations[i].length - 1];
                const cardElement = this.createCardElement(card, true);
                cardElement.style.position = 'relative';
                foundationPile.appendChild(cardElement);
            } else {
                foundationPile.innerHTML = `<div class="card-placeholder">${this.suitSymbols[this.suits[i]]}</div>`;
            }
        }
    }
    
    renderTableau() {
        for (let col = 0; col < 7; col++) {
            const tableauPile = document.getElementById(`tableau-${col}`);
            tableauPile.innerHTML = '';
            
            if (this.tableau[col].length === 0) {
                tableauPile.innerHTML = '<div class="card-placeholder">K</div>';
                continue;
            }
            
            this.tableau[col].forEach((card, index) => {
                const cardElement = this.createCardElement(card, card.faceUp);
                cardElement.style.position = 'absolute';
                cardElement.style.top = `${index * 20}px`;
                cardElement.style.zIndex = index;
                
                if (card.faceUp) {
                    cardElement.addEventListener('click', () => this.selectCard(card, 'tableau', col));
                    this.setupCardDrag(cardElement, card, 'tableau', col);
                }
                
                tableauPile.appendChild(cardElement);
            });
        }
    }
    
    createCardElement(card, faceUp) {
        const cardElement = document.createElement('div');
        cardElement.className = `card ${card.color}`;
        cardElement.setAttribute('data-card-id', card.id);
        
        if (!faceUp) {
            cardElement.classList.add('face-down');
            cardElement.innerHTML = '';
        } else {
            // Create clean card layout with corner indices
            cardElement.innerHTML = `
                <div class="card-corner-top">
                    <div>${card.rank}</div>
                    <div>${this.suitSymbols[card.suit]}</div>
                </div>
                <div class="card-value">${card.rank}</div>
                <div class="card-suit">${this.suitSymbols[card.suit]}</div>
                <div class="card-corner-bottom">
                    <div>${card.rank}</div>
                    <div>${this.suitSymbols[card.suit]}</div>
                </div>
            `;
        }
        
        // Add premium entrance animation
        cardElement.style.opacity = '0';
        cardElement.style.transform = 'scale(0.8) rotateY(180deg)';
        
        // Smooth entrance animation
        requestAnimationFrame(() => {
            cardElement.style.transition = 'all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            cardElement.style.opacity = '1';
            cardElement.style.transform = 'scale(1) rotateY(0deg)';
        });
        
        return cardElement;
    }
    
    setupCardDrag(cardElement, card, pileType, pileIndex = null) {
        cardElement.draggable = true;
        
        cardElement.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', JSON.stringify({
                card: card,
                pileType: pileType,
                pileIndex: pileIndex
            }));
            cardElement.classList.add('dragging');
            
            // Store the original position for potential return animation
            this.dragStartInfo = {
                element: cardElement,
                rect: cardElement.getBoundingClientRect(),
                pileType: pileType,
                pileIndex: pileIndex
            };
        });
        
        cardElement.addEventListener('dragend', () => {
            cardElement.classList.remove('dragging');
            // Don't clear dragStartInfo here - we need it for invalid move animation
        });
    }
    
    handleDragOver(e) {
        e.preventDefault();
        const pile = e.currentTarget;
        pile.classList.add('drag-over');
    }
    
    handleDragLeave(e) {
        const pile = e.currentTarget;
        pile.classList.remove('drag-over', 'valid-drop', 'invalid-drop');
    }
    
    handleDrop(e) {
        e.preventDefault();
        const pile = e.currentTarget;
        pile.classList.remove('drag-over', 'valid-drop', 'invalid-drop');
        
        try {
            const dragData = JSON.parse(e.dataTransfer.getData('text/plain'));
            const { card, pileType, pileIndex } = dragData;
            
            // Determine target pile
            let targetType, targetIndex;
            if (pile.classList.contains('foundation-pile')) {
                targetType = 'foundation';
                targetIndex = parseInt(pile.id.split('-')[1]);
            } else if (pile.classList.contains('tableau-pile')) {
                targetType = 'tableau';
                targetIndex = parseInt(pile.id.split('-')[1]);
            } else {
                return; // Invalid drop target
            }
            
            // Check if move is valid before attempting
            let cardsToMove = [];
            if (pileType === 'waste') {
                cardsToMove = [card];
            } else if (pileType === 'tableau') {
                const fromPile = this.tableau[pileIndex];
                const cardIndex = fromPile.indexOf(card);
                cardsToMove = fromPile.slice(cardIndex);
            }
            
            if (this.isValidMove(cardsToMove, targetType, targetIndex)) {
                // Valid move - proceed normally
                this.moveCards(card, pileType, pileIndex, targetType, targetIndex);
                this.dragStartInfo = null; // Clear drag info
            } else {
                // Invalid move - show red X and animate back to source
                const dropPosition = { x: e.clientX, y: e.clientY };
                this.showInvalidMoveAnimation(card, pile, pileType, pileIndex, dropPosition);
            }
        } catch (error) {
            console.error('Error handling drop:', error);
        }
    }
    
    selectCard(card, pileType, pileIndex = null) {
        // Clear previous selection
        document.querySelectorAll('.card.selected').forEach(el => {
            el.classList.remove('selected');
        });
        
        if (this.selectedCard === card) {
            // Deselect if clicking the same card
            this.selectedCard = null;
            this.selectedPile = null;
            return;
        }
        
        this.selectedCard = card;
        this.selectedPile = { type: pileType, index: pileIndex };
        
        // Highlight selected card
        const cardElement = document.querySelector(`[data-card-id="${card.id}"]`);
        if (cardElement) {
            cardElement.classList.add('selected');
        }
        
        // Try auto-move to foundation
        this.tryAutoMoveToFoundation(card, pileType, pileIndex);
    }
    
    tryAutoMoveToFoundation(card, pileType, pileIndex) {
        for (let i = 0; i < 4; i++) {
            if (this.canMoveToFoundation(card, i)) {
                this.moveCards(card, pileType, pileIndex, 'foundation', i);
                return;
            }
        }
    }
    
    moveCards(card, fromType, fromIndex, toType, toIndex) {
        let fromPile, toPile;
        let cardsToMove = [];
        let cardIndex;
        
        // Get source pile and cards to move
        if (fromType === 'waste') {
            fromPile = this.waste;
            cardIndex = fromPile.indexOf(card);
            cardsToMove = fromPile.slice(cardIndex);
        } else if (fromType === 'tableau') {
            fromPile = this.tableau[fromIndex];
            cardIndex = fromPile.indexOf(card);
            cardsToMove = fromPile.slice(cardIndex);
        } else {
            return false;
        }
        
        // Get target pile
        if (toType === 'foundation') {
            toPile = this.foundations[toIndex];
        } else if (toType === 'tableau') {
            toPile = this.tableau[toIndex];
        }
        
        // Validate move
        if (!this.isValidMove(cardsToMove, toType, toIndex)) {
            return false;
        }
        
        // Add premium move animation
        const cardElement = document.querySelector(`[data-card-id="${card.id}"]`);
        if (cardElement) {
            cardElement.style.transition = 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            cardElement.style.transform = 'scale(1.1) rotateZ(5deg)';
            
            setTimeout(() => {
                cardElement.style.transform = 'scale(1) rotateZ(0deg)';
            }, 200);
        }
        
        // Perform move
        fromPile.splice(cardIndex);
        toPile.push(...cardsToMove);
        
        // Flip card if necessary with premium animation
        if (fromType === 'tableau' && fromPile.length > 0) {
            const lastCard = fromPile[fromPile.length - 1];
            if (!lastCard.faceUp) {
                lastCard.faceUp = true;
                this.score += 5; // Points for flipping card
                
                // Add flip animation
                setTimeout(() => {
                    const flippedCardElement = document.querySelector(`[data-card-id="${lastCard.id}"]`);
                    if (flippedCardElement) {
                        flippedCardElement.style.transform = 'rotateY(180deg) scale(1.1)';
                        setTimeout(() => {
                            flippedCardElement.style.transform = 'rotateY(0deg) scale(1)';
                        }, 300);
                    }
                }, 100);
            }
        }
        
        // Update score with visual feedback
        if (toType === 'foundation') {
            this.score += 10; // Points for moving to foundation
            this.showScoreAnimation('+10');
        } else if (fromType === 'waste' && toType === 'tableau') {
            this.score += 5; // Points for moving from waste to tableau
            this.showScoreAnimation('+5');
        }
        
        this.moves++;
        this.selectedCard = null;
        this.selectedPile = null;
        
        setTimeout(() => {
            this.renderGame();
            this.updateScore();
            this.checkWin();
        }, 100);
        
        return true;
    }
    
    isValidMove(cards, toType, toIndex) {
        if (cards.length === 0) return false;
        
        const firstCard = cards[0];
        
        if (toType === 'foundation') {
            // Only single cards can move to foundation
            if (cards.length > 1) return false;
            return this.canMoveToFoundation(firstCard, toIndex);
        } else if (toType === 'tableau') {
            const targetPile = this.tableau[toIndex];
            
            if (targetPile.length === 0) {
                // Empty tableau pile - only Kings can be placed
                return firstCard.rank === 'K';
            }
            
            const topCard = targetPile[targetPile.length - 1];
            
            // Must be different color and one rank lower
            return firstCard.color !== topCard.color && 
                   firstCard.value === topCard.value - 1;
        }
        
        return false;
    }
    
    canMoveToFoundation(card, foundationIndex) {
        const foundation = this.foundations[foundationIndex];
        
        if (foundation.length === 0) {
            return card.rank === 'A';
        }
        
        const topCard = foundation[foundation.length - 1];
        return card.suit === topCard.suit && card.value === topCard.value + 1;
    }
    
    dealFromStock() {
        if (this.stock.length > 0) {
            const card = this.stock.pop();
            card.faceUp = true;
            this.waste.push(card);
            this.moves++;
        } else if (this.waste.length > 0) {
            // Reset stock from waste
            while (this.waste.length > 0) {
                const card = this.waste.pop();
                card.faceUp = false;
                this.stock.push(card);
            }
            this.moves++;
        }
        
        this.renderGame();
        this.updateScore();
        
        // Check for game over after dealing
        setTimeout(() => {
            this.checkGameOver();
        }, 100);
    }
    
    updateScore() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('moves').textContent = this.moves;
    }
    
    checkWin() {
        const totalCards = this.foundations.reduce((sum, pile) => sum + pile.length, 0);
        if (totalCards === 52) {
            this.showWinMessage();
        } else {
            // Check for game over (no more moves available)
            this.checkGameOver();
        }
    }

    checkGameOver() {
        // Don't check during auto-play
        if (this.isAutoPlaying) return;
        
        // Check if any moves are possible
        if (!this.hasAvailableMoves()) {
            this.showLoseMessage();
        }
    }

    hasAvailableMoves() {
        // Check if we can move any cards to foundations
        for (let col = 0; col < 7; col++) {
            const tableau = this.tableau[col];
            if (tableau.length > 0) {
                const topCard = tableau[tableau.length - 1];
                if (topCard.faceUp) {
                    for (let f = 0; f < 4; f++) {
                        if (this.canMoveToFoundation(topCard, f)) {
                            return true;
                        }
                    }
                }
            }
        }

        // Check if we can move from waste to foundation
        if (this.waste.length > 0) {
            const wasteCard = this.waste[this.waste.length - 1];
            for (let f = 0; f < 4; f++) {
                if (this.canMoveToFoundation(wasteCard, f)) {
                    return true;
                }
            }
        }

        // Check if we can move cards between tableau columns
        for (let fromCol = 0; fromCol < 7; fromCol++) {
            const fromTableau = this.tableau[fromCol];
            if (fromTableau.length > 0) {
                const topCard = fromTableau[fromTableau.length - 1];
                if (topCard.faceUp) {
                    for (let toCol = 0; toCol < 7; toCol++) {
                        if (fromCol !== toCol) {
                            const cardsToMove = [topCard];
                            if (this.isValidMove(cardsToMove, 'tableau', toCol)) {
                                return true;
                            }
                        }
                    }
                }
            }
        }

        // Check if we can move from waste to tableau
        if (this.waste.length > 0) {
            const wasteCard = this.waste[this.waste.length - 1];
            for (let col = 0; col < 7; col++) {
                const cardsToMove = [wasteCard];
                if (this.isValidMove(cardsToMove, 'tableau', col)) {
                    return true;
                }
            }
        }

        // Check if we can flip any cards
        for (let col = 0; col < 7; col++) {
            const tableau = this.tableau[col];
            if (tableau.length > 0) {
                const topCard = tableau[tableau.length - 1];
                if (!topCard.faceUp) {
                    return true;
                }
            }
        }

        // Check if we can deal from stock or reset stock from waste
        if (this.stock.length > 0 || this.waste.length > 0) {
            return true;
        }

        return false; // No moves available
    }
    
    showWinMessage() {
        // Add confetti effect
        this.createConfetti();
        
        document.getElementById('final-score').textContent = this.score;
        document.getElementById('final-moves').textContent = this.moves;
        document.getElementById('win-message').classList.remove('hidden');
        
        // Add premium win sound effect (visual)
        const winMessage = document.getElementById('win-message');
        winMessage.style.background = 'radial-gradient(circle, rgba(255, 215, 0, 0.3) 0%, rgba(0, 0, 0, 0.8) 70%)';
    }

    showLoseMessage() {
        // Stop auto-play if running
        this.stopAutoPlay();
        
        document.getElementById('lose-final-score').textContent = this.score;
        document.getElementById('lose-final-moves').textContent = this.moves;
        document.getElementById('lose-message').classList.remove('hidden');
        
        // Start countdown timer
        let countdown = 5;
        const countdownElement = document.getElementById('restart-countdown');
        countdownElement.textContent = countdown;
        
        const countdownInterval = setInterval(() => {
            countdown--;
            countdownElement.textContent = countdown;
            
            if (countdown <= 0) {
                clearInterval(countdownInterval);
                this.hideLoseMessage();
                this.newGame();
            }
        }, 1000);
        
        // Store interval reference to clear it if needed
        this.loseCountdownInterval = countdownInterval;
    }

    hideWinMessage() {
        document.getElementById('win-message').classList.add('hidden');
    }

    hideLoseMessage() {
        document.getElementById('lose-message').classList.add('hidden');
        if (this.loseCountdownInterval) {
            clearInterval(this.loseCountdownInterval);
            this.loseCountdownInterval = null;
        }
    }
    
    createConfetti() {
        const colors = ['#ffd700', '#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b'];
        const confettiContainer = document.createElement('div');
        confettiContainer.style.position = 'fixed';
        confettiContainer.style.top = '0';
        confettiContainer.style.left = '0';
        confettiContainer.style.width = '100%';
        confettiContainer.style.height = '100%';
        confettiContainer.style.pointerEvents = 'none';
        confettiContainer.style.zIndex = '9999';
        document.body.appendChild(confettiContainer);
        
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.style.position = 'absolute';
            confetti.style.width = '10px';
            confetti.style.height = '10px';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.top = '-10px';
            confetti.style.borderRadius = '50%';
            confetti.style.animation = `fall ${2 + Math.random() * 3}s linear forwards`;
            confettiContainer.appendChild(confetti);
        }
        
        // Add keyframes for confetti animation
        if (!document.getElementById('confetti-styles')) {
            const style = document.createElement('style');
            style.id = 'confetti-styles';
            style.textContent = `
                @keyframes fall {
                    0% {
                        transform: translateY(-10px) rotate(0deg);
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(100vh) rotate(360deg);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        setTimeout(() => {
            document.body.removeChild(confettiContainer);
        }, 5000);
    }
    
    showScoreAnimation(points) {
        const scoreElement = document.getElementById('score');
        const animation = document.createElement('div');
        animation.textContent = points;
        animation.style.position = 'absolute';
        animation.style.color = '#fbbf24';
        animation.style.fontWeight = 'bold';
        animation.style.fontSize = '18px';
        animation.style.zIndex = '1000';
        animation.style.pointerEvents = 'none';
        animation.style.animation = 'scoreFloat 1s ease-out forwards';
        
        scoreElement.style.position = 'relative';
        scoreElement.appendChild(animation);
        
        // Add keyframes for score animation
        if (!document.getElementById('score-animation-styles')) {
            const style = document.createElement('style');
            style.id = 'score-animation-styles';
            style.textContent = `
                @keyframes scoreFloat {
                    0% {
                        transform: translateY(0) scale(1);
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(-30px) scale(1.2);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        setTimeout(() => {
            if (scoreElement.contains(animation)) {
                scoreElement.removeChild(animation);
            }
        }, 1000);
    }
    
    highlightAutoMove(card, fromType, fromIndex, toType, toIndex) {
        // Clear any existing highlights
        this.clearHighlights();
        
        console.log(`Auto move: ${card.rank} of ${card.suit} from ${fromType} to ${toType}`);
        
        // Highlight source card
        const sourceCard = document.querySelector(`[data-card-id="${card.id}"]`);
        if (sourceCard) {
            sourceCard.classList.add('auto-play-source');
            console.log('Source card highlighted');
        }
        
        // Highlight target pile
        let targetPile;
        if (toType === 'foundation') {
            targetPile = document.getElementById(`foundation-${toIndex}`);
        } else if (toType === 'tableau') {
            targetPile = document.getElementById(`tableau-${toIndex}`);
        }
        
        if (targetPile) {
            targetPile.classList.add('auto-play-target');
            console.log('Target pile highlighted');
        }
        
        // Animate card movement after highlighting
        setTimeout(() => {
            console.log('Starting card animation');
            this.animateCardMovement(card, fromType, fromIndex, toType, toIndex);
        }, 500);
    }
    
    highlightFlipCard(card, colIndex) {
        this.clearHighlights();
        const tableauPile = document.getElementById(`tableau-${colIndex}`);
        if (tableauPile) {
            tableauPile.classList.add('auto-play-flip');
        }
    }
    
    highlightStockDeal() {
        this.clearHighlights();
        const stockPile = document.getElementById('stock-pile');
        if (stockPile) {
            stockPile.classList.add('auto-play-stock');
        }
    }
    
    clearHighlights() {
        // Remove all auto-play highlighting classes
        document.querySelectorAll('.auto-play-source, .auto-play-target, .auto-play-flip, .auto-play-stock')
            .forEach(el => {
                el.classList.remove('auto-play-source', 'auto-play-target', 'auto-play-flip', 'auto-play-stock');
            });
        
        // Remove any existing indicators
        document.querySelectorAll('.move-indicator, .flip-indicator, .stock-indicator')
            .forEach(el => el.remove());
    }
    
    showInvalidMoveAnimation(card, targetPile, sourcePileType, sourcePileIndex, dropPosition) {
        // Create red X indicator at target location
        const redX = document.createElement('div');
        redX.className = 'invalid-move-indicator';
        redX.innerHTML = '✗';
        redX.style.position = 'fixed';
        redX.style.color = '#ef4444';
        redX.style.fontSize = '48px';
        redX.style.fontWeight = 'bold';
        redX.style.zIndex = '3000';
        redX.style.pointerEvents = 'none';
        redX.style.textShadow = '2px 2px 4px rgba(0, 0, 0, 0.5)';
        redX.style.opacity = '0';
        redX.style.transform = 'scale(0.5)';
        redX.style.transition = 'all 0.3s ease-out';
        
        // Position red X at the target pile center
        const targetRect = targetPile.getBoundingClientRect();
        redX.style.left = `${targetRect.left + targetRect.width / 2 - 24}px`;
        redX.style.top = `${targetRect.top + targetRect.height / 2 - 24}px`;
        
        document.body.appendChild(redX);
        
        // Animate red X appearance
        requestAnimationFrame(() => {
            redX.style.opacity = '1';
            redX.style.transform = 'scale(1.2)';
        });
        
        // Add shake effect to target pile
        targetPile.style.animation = 'invalidMove 0.5s ease-in-out';
        
        // Create flying card animation back to source
        this.createFlyingCardAnimation(card, dropPosition, sourcePileType, sourcePileIndex);
        
        // Clean up red X after animation
        setTimeout(() => {
            if (document.body.contains(redX)) {
                redX.style.opacity = '0';
                redX.style.transform = 'scale(0.5)';
                setTimeout(() => {
                    if (document.body.contains(redX)) {
                        document.body.removeChild(redX);
                    }
                }, 300);
            }
            targetPile.style.animation = '';
        }, 1500);
    }
    
    createFlyingCardAnimation(card, startPosition, sourcePileType, sourcePileIndex) {
        // Find the source pile for the destination
        let sourcePile;
        if (sourcePileType === 'waste') {
            sourcePile = document.getElementById('waste-pile');
        } else if (sourcePileType === 'tableau') {
            sourcePile = document.getElementById(`tableau-${sourcePileIndex}`);
        }
        
        if (!sourcePile) {
            console.error('Source pile not found:', sourcePileType, sourcePileIndex);
            return;
        }
        
        // Get the original card element to copy its appearance
        const originalCard = document.querySelector(`[data-card-id="${card.id}"]`);
        if (!originalCard) {
            console.error('Original card not found:', card.id);
            return;
        }
        
        // Create a flying clone of the card
        const flyingCard = originalCard.cloneNode(true);
        flyingCard.classList.add('card-flying-back');
        flyingCard.style.position = 'fixed';
        flyingCard.style.zIndex = '2500';
        flyingCard.style.pointerEvents = 'none';
        flyingCard.style.margin = '0';
        flyingCard.style.transform = 'scale(1) rotateZ(0deg)';
        flyingCard.style.transition = 'none';
        flyingCard.style.border = '2px solid #ef4444';
        flyingCard.style.boxShadow = '0 0 30px rgba(239, 68, 68, 0.8), 0 8px 32px rgba(239, 68, 68, 0.4)';
        flyingCard.style.filter = 'brightness(1.3) saturate(1.4)';
        
        // Use drop position as starting point, or fall back to drag start info
        let startX, startY;
        if (startPosition) {
            startX = startPosition.x - 37.5; // Half card width
            startY = startPosition.y - 52.5; // Half card height
        } else if (this.dragStartInfo) {
            startX = this.dragStartInfo.rect.left;
            startY = this.dragStartInfo.rect.top;
        } else {
            // Fallback to original card position
            const cardRect = originalCard.getBoundingClientRect();
            startX = cardRect.left;
            startY = cardRect.top;
        }
        
        // Set initial position
        flyingCard.style.left = `${startX}px`;
        flyingCard.style.top = `${startY}px`;
        flyingCard.style.width = '75px';
        flyingCard.style.height = '105px';
        flyingCard.style.opacity = '1';
        
        document.body.appendChild(flyingCard);
        
        // Hide the original card during animation
        originalCard.style.opacity = '0.3';
        
        // Calculate destination position (center of source pile)
        const sourceRect = sourcePile.getBoundingClientRect();
        const destX = sourceRect.left + (sourceRect.width / 2) - 37.5;
        const destY = sourceRect.top + (sourceRect.height / 2) - 52.5;
        
        // Force reflow before starting animation
        flyingCard.offsetHeight;
        
        // Start the flying animation
        setTimeout(() => {
            flyingCard.style.transition = 'all 1.0s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            flyingCard.style.left = `${destX}px`;
            flyingCard.style.top = `${destY}px`;
            flyingCard.style.transform = 'scale(0.85) rotateZ(-8deg)';
            flyingCard.style.opacity = '0.8';
        }, 100);
        
        // Clean up after animation
        setTimeout(() => {
            // Remove flying card
            if (document.body.contains(flyingCard)) {
                document.body.removeChild(flyingCard);
            }
            
            // Restore original card with bounce effect
            originalCard.style.transition = 'all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
            originalCard.style.opacity = '1';
            originalCard.style.transform = 'scale(1.08)';
            
            // Return to normal
            setTimeout(() => {
                originalCard.style.transform = 'scale(1)';
                setTimeout(() => {
                    originalCard.style.transition = '';
                    originalCard.style.transform = '';
                    this.dragStartInfo = null; // Clean up drag info
                }, 400);
            }, 150);
        }, 1200);
    }
    
    animateCardMovement(card, fromType, fromIndex, toType, toIndex) {
        const sourceCard = document.querySelector(`[data-card-id="${card.id}"]`);
        if (!sourceCard) {
            console.log('Source card not found:', card.id);
            return;
        }
        
        // Get source and target positions
        let targetElement;
        if (toType === 'foundation') {
            targetElement = document.getElementById(`foundation-${toIndex}`);
        } else if (toType === 'tableau') {
            targetElement = document.getElementById(`tableau-${toIndex}`);
        }
        
        if (!targetElement) {
            console.log('Target element not found:', toType, toIndex);
            return;
        }
        
        // Create a clone of the card for animation
        const cardClone = sourceCard.cloneNode(true);
        cardClone.classList.add('card-flying');
        cardClone.classList.remove('auto-play-source'); // Remove highlighting
        cardClone.style.position = 'fixed';
        cardClone.style.zIndex = '2000';
        cardClone.style.pointerEvents = 'none';
        cardClone.style.margin = '0';
        cardClone.style.transition = 'none'; // Remove any existing transitions
        
        // Get accurate positions
        const sourceRect = sourceCard.getBoundingClientRect();
        const targetRect = targetElement.getBoundingClientRect();
        
        // Set initial position exactly matching the source card
        cardClone.style.left = `${sourceRect.left}px`;
        cardClone.style.top = `${sourceRect.top}px`;
        cardClone.style.width = `${sourceRect.width}px`;
        cardClone.style.height = `${sourceRect.height}px`;
        cardClone.style.transform = 'scale(1) rotateZ(0deg)';
        
        document.body.appendChild(cardClone);
        console.log('Card clone created and positioned');
        
        // Hide the original card
        sourceCard.style.opacity = '0.3';
        
        // Calculate target position (center of target pile)
        const targetCenterX = targetRect.left + (targetRect.width / 2) - (sourceRect.width / 2);
        const targetCenterY = targetRect.top + (targetRect.height / 2) - (sourceRect.height / 2);
        
        // Force a reflow to ensure initial position is set
        cardClone.offsetHeight;
        
        // Start the animation
        setTimeout(() => {
            cardClone.style.transition = 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            cardClone.style.left = `${targetCenterX}px`;
            cardClone.style.top = `${targetCenterY}px`;
            cardClone.style.transform = 'scale(1.1) rotateZ(10deg)';
            cardClone.style.boxShadow = '0 25px 50px rgba(251, 191, 36, 0.4)';
            
            console.log(`Animating card from (${sourceRect.left}, ${sourceRect.top}) to (${targetCenterX}, ${targetCenterY})`);
        }, 50);
        
        // Clean up after animation
        setTimeout(() => {
            if (document.body.contains(cardClone)) {
                document.body.removeChild(cardClone);
                console.log('Card clone removed');
            }
            sourceCard.style.opacity = '1';
        }, 900);
    }
    
    toggleRules() {
        const rulesContent = document.getElementById('rules-content');
        const toggleBtn = document.getElementById('toggle-rules');
        
        if (rulesContent.classList.contains('collapsed')) {
            rulesContent.classList.remove('collapsed');
            toggleBtn.textContent = '−';
        } else {
            rulesContent.classList.add('collapsed');
            toggleBtn.textContent = '+';
        }
    }
    
    hideWinMessage() {
        document.getElementById('win-message').classList.add('hidden');
    }
    
    newGame() {
        this.score = 0;
        this.moves = 0;
        this.selectedCard = null;
        this.selectedPile = null;
        this.lastAutoMoves = [];
        this.stockCycles = 0;
        this.stopAutoPlay();
        this.hideLoseMessage();
        this.hideWinMessage();
        this.initializeGame();
    }
    
    toggleAutoPlay() {
        if (this.isAutoPlaying) {
            this.stopAutoPlay();
        } else {
            this.startAutoPlay();
        }
    }
    
    startAutoPlay() {
        this.isAutoPlaying = true;
        const button = document.getElementById('auto-play-btn');
        button.textContent = 'Stop Auto';
        button.classList.add('auto-play-active');
        
        this.autoPlayInterval = setInterval(() => {
            if (!this.performAutoMove()) {
                this.stopAutoPlay();
            }
        }, 2500); // Increased to 2.5 seconds for full animation cycle
    }
    
    stopAutoPlay() {
        this.isAutoPlaying = false;
        const button = document.getElementById('auto-play-btn');
        button.textContent = 'Auto Play';
        button.classList.remove('auto-play-active');
        
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
        
        // Clear any remaining highlights
        this.clearHighlights();
    }
    
    performAutoMove() {
        // Clean up old move history (keep last 10 moves)
        if (this.lastAutoMoves.length > 10) {
            this.lastAutoMoves = this.lastAutoMoves.slice(-10);
        }
        
        // Priority 1: Always move cards to foundation (highest priority)
        const foundationMove = this.findFoundationMove();
        if (foundationMove) {
            this.recordMove(foundationMove);
            this.executeMove(foundationMove);
            return true;
        }
        
        // Priority 2: Flip face-down cards (reveals new possibilities)
        const flipMove = this.findFlipMove();
        if (flipMove) {
            this.recordMove(flipMove);
            this.executeMove(flipMove);
            return true;
        }
        
        // Priority 3: Strategic tableau moves (avoid repetitive moves)
        const tableauMove = this.findStrategicTableauMove();
        if (tableauMove) {
            this.recordMove(tableauMove);
            this.executeMove(tableauMove);
            return true;
        }
        
        // Priority 4: Move from waste to tableau (if beneficial)
        const wasteToTableauMove = this.findWasteToTableauMove();
        if (wasteToTableauMove) {
            this.recordMove(wasteToTableauMove);
            this.executeMove(wasteToTableauMove);
            return true;
        }
        
        // Priority 5: Deal from stock (but limit cycles to prevent infinite loops)
        if (this.canDealFromStock()) {
            const stockMove = { type: 'stock', from: 'stock', to: 'waste' };
            this.recordMove(stockMove);
            this.executeMove(stockMove);
            return true;
        }
        
        return false; // No moves available
    }
    
    findFoundationMove() {
        // Check tableau cards first
        for (let col = 0; col < 7; col++) {
            const tableau = this.tableau[col];
            if (tableau.length > 0) {
                const topCard = tableau[tableau.length - 1];
                if (topCard.faceUp) {
                    for (let f = 0; f < 4; f++) {
                        if (this.canMoveToFoundation(topCard, f)) {
                            return {
                                type: 'foundation',
                                card: topCard,
                                from: 'tableau',
                                fromIndex: col,
                                to: 'foundation',
                                toIndex: f
                            };
                        }
                    }
                }
            }
        }
        
        // Check waste card
        if (this.waste.length > 0) {
            const wasteCard = this.waste[this.waste.length - 1];
            for (let f = 0; f < 4; f++) {
                if (this.canMoveToFoundation(wasteCard, f)) {
                    return {
                        type: 'foundation',
                        card: wasteCard,
                        from: 'waste',
                        fromIndex: null,
                        to: 'foundation',
                        toIndex: f
                    };
                }
            }
        }
        
        return null;
    }
    
    findFlipMove() {
        for (let col = 0; col < 7; col++) {
            const tableau = this.tableau[col];
            if (tableau.length > 0) {
                const topCard = tableau[tableau.length - 1];
                if (!topCard.faceUp) {
                    return {
                        type: 'flip',
                        card: topCard,
                        from: 'tableau',
                        fromIndex: col
                    };
                }
            }
        }
        return null;
    }
    
    findStrategicTableauMove() {
        // Look for moves that expose face-down cards or create strategic advantages
        const moves = [];
        
        for (let fromCol = 0; fromCol < 7; fromCol++) {
            const fromTableau = this.tableau[fromCol];
            if (fromTableau.length > 0) {
                const topCard = fromTableau[fromTableau.length - 1];
                if (topCard.faceUp) {
                    for (let toCol = 0; toCol < 7; toCol++) {
                        if (fromCol !== toCol) {
                            const cardsToMove = [topCard];
                            if (this.isValidMove(cardsToMove, 'tableau', toCol)) {
                                const move = {
                                    type: 'tableau',
                                    card: topCard,
                                    from: 'tableau',
                                    fromIndex: fromCol,
                                    to: 'tableau',
                                    toIndex: toCol
                                };
                                
                                // Check if this move would expose a face-down card
                                const wouldExposeFaceDown = fromTableau.length > 1 && !fromTableau[fromTableau.length - 2].faceUp;
                                
                                // Avoid moves we've recently made
                                if (!this.isMoveRecent(move)) {
                                    moves.push({
                                        move: move,
                                        priority: wouldExposeFaceDown ? 10 : 1 // Higher priority for exposing cards
                                    });
                                }
                            }
                        }
                    }
                }
            }
        }
        
        // Return the highest priority move
        if (moves.length > 0) {
            moves.sort((a, b) => b.priority - a.priority);
            return moves[0].move;
        }
        
        return null;
    }
    
    findWasteToTableauMove() {
        if (this.waste.length > 0) {
            const wasteCard = this.waste[this.waste.length - 1];
            for (let col = 0; col < 7; col++) {
                const cardsToMove = [wasteCard];
                if (this.isValidMove(cardsToMove, 'tableau', col)) {
                    const move = {
                        type: 'waste-to-tableau',
                        card: wasteCard,
                        from: 'waste',
                        fromIndex: null,
                        to: 'tableau',
                        toIndex: col
                    };
                    
                    // Only make this move if it's not repetitive
                    if (!this.isMoveRecent(move)) {
                        return move;
                    }
                }
            }
        }
        return null;
    }
    
    canDealFromStock() {
        // Limit stock cycles to prevent infinite loops
        if (this.stock.length > 0) {
            return true;
        } else if (this.waste.length > 0 && this.stockCycles < 3) {
            return true;
        }
        return false;
    }
    
    isMoveRecent(move) {
        // Check if a similar move was made recently
        return this.lastAutoMoves.some(recentMove => 
            this.movesAreEquivalent(move, recentMove)
        );
    }
    
    movesAreEquivalent(move1, move2) {
        if (move1.type !== move2.type) return false;
        
        if (move1.type === 'stock') {
            return true; // All stock moves are equivalent
        }
        
        return move1.from === move2.from &&
               move1.fromIndex === move2.fromIndex &&
               move1.to === move2.to &&
               move1.toIndex === move2.toIndex &&
               move1.card && move2.card &&
               move1.card.id === move2.card.id;
    }
    
    recordMove(move) {
        this.lastAutoMoves.push({
            ...move,
            timestamp: Date.now()
        });
    }
    
    executeMove(move) {
        switch (move.type) {
            case 'foundation':
            case 'tableau':
            case 'waste-to-tableau':
                this.highlightAutoMove(move.card, move.from, move.fromIndex, move.to, move.toIndex);
                setTimeout(() => {
                    this.moveCards(move.card, move.from, move.fromIndex, move.to, move.toIndex);
                }, 1400);
                break;
                
            case 'flip':
                this.highlightFlipCard(move.card, move.fromIndex);
                setTimeout(() => {
                    move.card.faceUp = true;
                    this.score += 5;
                    this.moves++;
                    this.renderGame();
                    this.updateScore();
                }, 800);
                break;
                
            case 'stock':
                this.highlightStockDeal();
                setTimeout(() => {
                    // Track if we're cycling through the deck
                    if (this.stock.length === 0 && this.waste.length > 0) {
                        this.stockCycles++;
                    }
                    this.dealFromStock();
                }, 800);
                break;
        }
    }
}

// Blackjack Game Class
class BlackjackGame {
    constructor() {
        this.deck = [];
        this.playerHand = [];
        this.dealerHand = [];
        this.chips = 1000;
        this.currentBet = 0;
        this.gamesPlayed = 0;
        this.gameInProgress = false;
        this.dealerRevealed = false;
        
        this.suits = ['hearts', 'diamonds', 'clubs', 'spades'];
        this.ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        this.suitSymbols = {
            'hearts': '♥',
            'diamonds': '♦',
            'clubs': '♣',
            'spades': '♠'
        };
        
        this.setupEventListeners();
        this.updateDisplay();
    }
    
    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', () => {
                this.switchGame(button.dataset.game);
            });
        });
        
        // Blackjack rules panel toggle
        document.getElementById('toggle-bj-rules').addEventListener('click', () => {
            this.toggleBlackjackRules();
        });
        
        // Bet buttons
        document.querySelectorAll('.bet-btn').forEach(button => {
            button.addEventListener('click', () => {
                this.placeBet(parseInt(button.dataset.amount));
            });
        });
        
        // Action buttons
        document.getElementById('bj-new-game-btn').addEventListener('click', () => {
            this.newGame();
        });
        
        document.getElementById('deal-btn').addEventListener('click', () => {
            this.deal();
        });
        
        document.getElementById('hit-btn').addEventListener('click', () => {
            this.hit();
        });
        
        document.getElementById('stand-btn').addEventListener('click', () => {
            this.stand();
        });
        
        document.getElementById('double-btn').addEventListener('click', () => {
            this.doubleDown();
        });
    }
    
    switchGame(gameType) {
        // Update tab buttons
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-game="${gameType}"]`).classList.add('active');
        
        // Update game content
        document.querySelectorAll('.game-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${gameType}-game`).classList.add('active');
    }
    
    toggleBlackjackRules() {
        const rulesContent = document.getElementById('bj-rules-content');
        const toggleBtn = document.getElementById('toggle-bj-rules');
        
        if (rulesContent.classList.contains('collapsed')) {
            rulesContent.classList.remove('collapsed');
            toggleBtn.textContent = '−';
        } else {
            rulesContent.classList.add('collapsed');
            toggleBtn.textContent = '+';
        }
    }
    
    createDeck() {
        this.deck = [];
        for (let suit of this.suits) {
            for (let i = 0; i < this.ranks.length; i++) {
                this.deck.push({
                    suit: suit,
                    rank: this.ranks[i],
                    value: this.getCardValue(this.ranks[i]),
                    color: (suit === 'hearts' || suit === 'diamonds') ? 'red' : 'black',
                    id: `bj-${suit}-${this.ranks[i]}`
                });
            }
        }
        this.shuffleDeck();
    }
    
    getCardValue(rank) {
        if (rank === 'A') return 11; // Ace high initially
        if (['J', 'Q', 'K'].includes(rank)) return 10;
        return parseInt(rank);
    }
    
    shuffleDeck() {
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
    }
    
    placeBet(amount) {
        if (this.gameInProgress) return;
        if (amount > this.chips) {
            this.showMessage("Insufficient chips!");
            return;
        }
        
        this.currentBet = amount;
        this.updateDisplay();
        this.showMessage(`Bet placed: $${amount}`);
        
        // Enable deal button
        document.getElementById('deal-btn').disabled = false;
    }
    
    deal() {
        if (this.currentBet === 0) {
            this.showMessage("Please place a bet first!");
            return;
        }
        
        this.createDeck();
        this.playerHand = [];
        this.dealerHand = [];
        this.gameInProgress = true;
        this.dealerRevealed = false;
        this.chips -= this.currentBet;
        
        // Deal initial cards
        this.playerHand.push(this.deck.pop());
        this.dealerHand.push(this.deck.pop());
        this.playerHand.push(this.deck.pop());
        this.dealerHand.push(this.deck.pop());
        
        this.updateDisplay();
        this.renderHands();
        
        // Check for blackjack
        if (this.getHandValue(this.playerHand) === 21) {
            this.stand(); // Auto-stand on blackjack
        } else {
            this.enableGameButtons(true);
            this.showMessage("Make your move!");
        }
        
        // Disable deal button
        document.getElementById('deal-btn').disabled = true;
    }
    
    hit() {
        if (!this.gameInProgress) return;
        
        this.playerHand.push(this.deck.pop());
        this.renderHands();
        
        const playerValue = this.getHandValue(this.playerHand);
        if (playerValue > 21) {
            this.endGame(false, "Bust! You lose.");
        } else if (playerValue === 21) {
            this.stand(); // Auto-stand on 21
        } else {
            // Disable double down after hitting
            document.getElementById('double-btn').disabled = true;
        }
    }
    
    stand() {
        if (!this.gameInProgress) return;
        
        this.dealerRevealed = true;
        this.enableGameButtons(false);
        
        // Dealer plays
        this.playDealer();
    }
    
    doubleDown() {
        if (!this.gameInProgress || this.playerHand.length !== 2) return;
        if (this.currentBet > this.chips) {
            this.showMessage("Insufficient chips to double down!");
            return;
        }
        
        this.chips -= this.currentBet;
        this.currentBet *= 2;
        this.updateDisplay();
        
        // Take exactly one more card
        this.playerHand.push(this.deck.pop());
        this.renderHands();
        
        const playerValue = this.getHandValue(this.playerHand);
        if (playerValue > 21) {
            this.endGame(false, "Bust! You lose.");
        } else {
            this.stand();
        }
    }
    
    playDealer() {
        this.renderHands();
        
        const playDealerCard = () => {
            const dealerValue = this.getHandValue(this.dealerHand);
            
            // Dealer stands on soft 17 (and all other 17s)
            // This means dealer only hits when value < 17
            const shouldHit = dealerValue < 17;
            
            if (shouldHit) {
                this.dealerHand.push(this.deck.pop());
                this.renderHands();
                setTimeout(playDealerCard, 1000);
            } else {
                this.resolveGame();
            }
        };
        
        setTimeout(playDealerCard, 1000);
    }
    
    resolveGame() {
        const playerValue = this.getHandValue(this.playerHand);
        const dealerValue = this.getHandValue(this.dealerHand);
        
        let message = "";
        let playerWins = false;
        
        if (dealerValue > 21) {
            message = "Dealer busts! You win!";
            playerWins = true;
        } else if (playerValue > dealerValue) {
            message = "You win!";
            playerWins = true;
        } else if (playerValue < dealerValue) {
            message = "Dealer wins!";
            playerWins = false;
        } else {
            message = "Push! It's a tie.";
            this.chips += this.currentBet; // Return bet
        }
        
        // Check for blackjack bonus
        if (playerWins && playerValue === 21 && this.playerHand.length === 2) {
            this.chips += Math.floor(this.currentBet * 2.5); // 3:2 payout
            message = "Blackjack! You win!";
        } else if (playerWins) {
            this.chips += this.currentBet * 2; // 1:1 payout
        }
        
        this.endGame(playerWins, message);
    }
    
    endGame(playerWon, message) {
        this.gameInProgress = false;
        this.dealerRevealed = true;
        this.gamesPlayed++;
        
        this.enableGameButtons(false);
        this.showMessage(message);
        this.updateDisplay();
        this.renderHands();
        
        // Reset for next game
        setTimeout(() => {
            this.currentBet = 0;
            this.updateDisplay();
            document.getElementById('deal-btn').disabled = false;
            
            if (this.chips <= 0) {
                this.showMessage("Game Over! No more chips. Starting new game...");
                setTimeout(() => this.newGame(), 3000);
            } else {
                this.showMessage("Place your bet for the next hand.");
            }
        }, 3000);
    }
    
    isSoftHand(hand) {
        // A soft hand contains an ace that's being counted as 11
        // This method is kept for potential future use
        let value = 0;
        let aces = 0;
        
        for (let card of hand) {
            if (card.rank === 'A') {
                aces++;
                value += 11;
            } else {
                value += card.value;
            }
        }
        
        // If we have aces and the total is <= 21, we have at least one ace counted as 11
        return aces > 0 && value <= 21;
    }
    
    getHandValue(hand) {
        let value = 0;
        let aces = 0;
        
        for (let card of hand) {
            if (card.rank === 'A') {
                aces++;
                value += 11;
            } else {
                value += card.value;
            }
        }
        
        // Convert aces from 11 to 1 if needed
        while (value > 21 && aces > 0) {
            value -= 10;
            aces--;
        }
        
        return value;
    }
    
    renderHands() {
        this.renderHand('dealer-hand', this.dealerHand, !this.dealerRevealed);
        this.renderHand('player-hand', this.playerHand, false);
        
        // Update hand values
        document.getElementById('dealer-value').textContent = 
            this.dealerRevealed ? this.getHandValue(this.dealerHand) : '?';
        document.getElementById('player-value').textContent = 
            this.getHandValue(this.playerHand);
    }
    
    renderHand(containerId, hand, hideFirstCard) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';
        
        hand.forEach((card, index) => {
            const cardElement = this.createCardElement(card, hideFirstCard && index === 0);
            container.appendChild(cardElement);
        });
    }
    
    createCardElement(card, faceDown) {
        const cardElement = document.createElement('div');
        cardElement.className = `card ${card.color}`;
        cardElement.setAttribute('data-card-id', card.id);
        
        if (faceDown) {
            cardElement.classList.add('face-down');
            cardElement.innerHTML = '';
        } else {
            cardElement.innerHTML = `
                <div class="card-corner-top">
                    <div>${card.rank}</div>
                    <div>${this.suitSymbols[card.suit]}</div>
                </div>
                <div class="card-value">${card.rank}</div>
                <div class="card-suit">${this.suitSymbols[card.suit]}</div>
                <div class="card-corner-bottom">
                    <div>${card.rank}</div>
                    <div>${this.suitSymbols[card.suit]}</div>
                </div>
            `;
        }
        
        // Add entrance animation
        cardElement.style.opacity = '0';
        cardElement.style.transform = 'scale(0.8) rotateY(180deg)';
        
        requestAnimationFrame(() => {
            cardElement.style.transition = 'all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            cardElement.style.opacity = '1';
            cardElement.style.transform = 'scale(1) rotateY(0deg)';
        });
        
        return cardElement;
    }
    
    enableGameButtons(enabled) {
        document.getElementById('hit-btn').disabled = !enabled;
        document.getElementById('stand-btn').disabled = !enabled;
        document.getElementById('double-btn').disabled = !enabled || this.playerHand.length !== 2;
    }
    
    updateDisplay() {
        document.getElementById('bj-chips').textContent = this.chips;
        document.getElementById('bj-games').textContent = this.gamesPlayed;
        document.getElementById('current-bet').textContent = this.currentBet;
    }
    
    showMessage(message) {
        document.getElementById('bj-message').textContent = message;
    }
    
    newGame() {
        this.chips = 1000;
        this.gamesPlayed = 0;
        this.currentBet = 0;
        this.gameInProgress = false;
        this.dealerRevealed = false;
        this.playerHand = [];
        this.dealerHand = [];
        
        this.updateDisplay();
        this.renderHands();
        this.enableGameButtons(false);
        this.showMessage("Welcome to Blackjack! Place your bet to start.");
        
        document.getElementById('deal-btn').disabled = false;
    }
}

// Initialize games when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new SolitaireGame();
    new BlackjackGame();
});

// Remove the old initialization
// document.addEventListener('DOMContentLoaded', () => {
//     new SolitaireGame();
// });
