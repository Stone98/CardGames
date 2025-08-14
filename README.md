# Premium Card Games Collection

A luxurious, web-based card game collection featuring **Klondike Solitaire** and **Blackjack** with premium visual design, smooth animations, and intelligent gameplay features.

![Premium Card Games](https://img.shields.io/badge/Games-Solitaire%20%7C%20Blackjack-blue)
![Tech Stack](https://img.shields.io/badge/Tech-HTML5%20%7C%20CSS3%20%7C%20JavaScript-green)
![Status](https://img.shields.io/badge/Status-Complete-brightgreen)

## 🎮 Games Included

### 🃏 Klondike Solitaire
Classic solitaire with modern enhancements:
- **Intelligent Auto-Play** with visual move demonstrations
- **Smart Move Detection** prevents repetitive loops
- **Animated Card Movements** with flying effects
- **Invalid Move Feedback** with red X indicator and card return animation
- **Game Over Detection** with automatic restart
- **Comprehensive Rules Panel** with collapsible sections
- **Win/Lose Tracking** with confetti celebrations

### ♦️ Blackjack
Professional casino-style blackjack:
- **Realistic Gameplay** with proper blackjack rules
- **Betting System** with $25, $50, $100, $250 chip options
- **Dealer AI** that hits on 16, stands on 17
- **Smart Card Values** with automatic Ace conversion
- **Animated Dealing** with face-down dealer card reveal
- **Chip Management** starting with $1000 bankroll
- **Strategy Guide** with basic blackjack tips

## ✨ Key Features

### 🎨 Premium Visual Design
- **Glass Morphism Effects** with backdrop blur and transparency
- **Luxury Color Scheme** with gold accents and gradients
- **Realistic Card Design** with corner indices and authentic textures
- **Smooth Animations** using CSS3 transforms and transitions
- **Responsive Layout** that works on desktop and mobile devices

### 🧠 Intelligent Gameplay
- **Auto-Play System** with strategic move prioritization
- **Move History Tracking** prevents infinite loops
- **Visual Learning** shows optimal moves and strategies
- **Invalid Move Prevention** with educational feedback
- **Game State Management** with proper win/lose detection

### 🎯 User Experience
- **Tab-Based Navigation** for easy game switching
- **Collapsible Rules Panels** for both games
- **Keyboard-Friendly** with proper focus management
- **Error Handling** with graceful fallbacks
- **Performance Optimized** with efficient DOM manipulation

## 🚀 Quick Start

1. **Clone or Download** the repository
2. **Open `index.html`** in any modern web browser
3. **Start Playing** - no installation or setup required!

```bash
# Clone the repository
git clone [repository-url]

# Navigate to the directory
cd Cards

# Open in browser
open index.html
```

## 🎲 How to Play

### Klondike Solitaire

#### Objective
Move all 52 cards to the foundation piles, building up by suit from Ace to King.

#### Setup
- 7 tableau columns with 1-7 cards each
- Top card of each column is face-up
- Remaining cards form the stock pile

#### Gameplay
- **Tableau**: Build down in alternating colors (red on black, black on red)
- **Foundations**: Build up by suit (A, 2, 3... J, Q, K)
- **Stock**: Click to deal cards to waste pile
- **Empty columns**: Only Kings can be placed

#### Controls
- **Drag & Drop**: Move cards between piles
- **Click**: Auto-move cards to foundations
- **Stock Pile**: Click to deal new cards
- **Auto-Play**: Watch intelligent gameplay demonstrations

#### Scoring
- +10 points for moving to foundation
- +5 points for flipping a card
- +5 points for waste to tableau moves

### Blackjack

#### Objective
Beat the dealer by getting as close to 21 as possible without going over.

#### Card Values
- **Aces**: 1 or 11 (whichever is better)
- **Face Cards**: King, Queen, Jack = 10
- **Number Cards**: Face value (2-10)

#### Gameplay
1. **Place Bet**: Choose $25, $50, $100, or $250
2. **Initial Deal**: 2 cards each (dealer's first card hidden)
3. **Your Turn**: Hit, Stand, or Double Down
4. **Dealer Turn**: Must hit on 16, stand on 17

#### Actions
- **Hit**: Take another card
- **Stand**: Keep current hand
- **Double Down**: Double bet + take exactly 1 card
- **Blackjack**: Ace + 10-value card (21 with 2 cards)

#### Winning
- **Blackjack**: 3:2 payout ($150 on $100 bet)
- **Regular Win**: 1:1 payout (double your bet)
- **Push**: Tie - bet returned
- **Bust**: Over 21 - lose bet

## 🛠️ Technical Details

### Architecture
```
Cards/
├── index.html          # Main HTML structure with game layouts
├── styles.css          # Complete styling with animations
├── script.js           # Game logic for both Solitaire and Blackjack
└── README.md          # This documentation
```

### Technologies Used
- **HTML5**: Semantic structure with drag & drop API
- **CSS3**: Advanced styling with:
  - Backdrop-filter for glass morphism
  - CSS Grid and Flexbox for layouts
  - Keyframe animations for smooth effects
  - Custom scrollbars and responsive design
- **JavaScript ES6+**: Object-oriented game logic with:
  - Class-based architecture
  - Event-driven interactions
  - DOM manipulation
  - Local state management

### Key Classes

#### `SolitaireGame`
- **Card Management**: Deck creation, shuffling, dealing
- **Move Validation**: Ensures legal moves according to solitaire rules
- **Auto-Play Engine**: Intelligent move selection with strategy
- **Animation System**: Handles card movements and visual effects
- **Game State**: Win/lose detection and scoring

#### `BlackjackGame`
- **Betting System**: Chip management and wager handling
- **Card Logic**: Hand evaluation with proper Ace handling
- **Dealer AI**: Automated dealer play following casino rules
- **Game Flow**: Deal → Player Actions → Dealer Play → Resolution

### Performance Features
- **Efficient Rendering**: Minimal DOM updates
- **Memory Management**: Proper cleanup of event listeners
- **Animation Optimization**: CSS transforms over position changes
- **Event Delegation**: Efficient event handling
- **Lazy Loading**: Elements created only when needed

## 🎨 Visual Features

### Card Design
- **Realistic Appearance**: Corner indices, suit symbols, premium textures
- **Smooth Animations**: Entrance effects, hover states, drag feedback
- **Face-Down Cards**: Ornate blue pattern with decorative elements
- **Visual Hierarchy**: Clear distinction between different card states

### Animation System
- **Flying Cards**: Smooth trajectory animations during auto-play
- **Invalid Move Feedback**: Red X indicator with card return animation
- **Hover Effects**: Subtle elevation and scaling
- **State Transitions**: Smooth changes between game states

### Responsive Design
- **Desktop Optimized**: Full-featured experience with large cards
- **Mobile Friendly**: Stacked layout with touch-friendly controls
- **Flexible Sizing**: Adapts to different screen resolutions
- **Accessibility**: Proper contrast ratios and keyboard navigation

## 🎯 Game Rules Reference

### Solitaire Strategy Tips
- Try to expose face-down cards first
- Don't rush to move cards to foundations
- Keep tableau columns balanced
- Use auto-play to learn optimal strategies

### Blackjack Basic Strategy
- Always hit on 11 or less
- Always stand on 17 or more
- Double down on 11 vs dealer 2-10
- Never take insurance
- Manage your bankroll wisely

## 🏆 Features Showcase

### Smart Auto-Play (Solitaire)
- **Move Prioritization**: Foundation moves → Card flips → Strategic tableau moves
- **Loop Prevention**: Tracks recent moves to avoid repetition
- **Educational Value**: Demonstrates optimal playing strategies
- **Visual Feedback**: Highlights source cards and target piles

### Invalid Move Animation
- **Immediate Feedback**: Red X appears at invalid drop location
- **Visual Learning**: Card flies back to source showing correct placement
- **Smooth Motion**: Professional-quality animation with easing
- **Error Prevention**: Teaches proper game rules through interaction

### Game Over Detection
- **Win Conditions**: Automatic detection of completed games
- **Lose Conditions**: Smart detection when no moves remain
- **Auto-Restart**: Solitaire automatically restarts after loss
- **Statistics**: Score and move tracking for both games

## 🔧 Browser Compatibility

### Supported Browsers
- **Chrome**: 88+ (Recommended)
- **Firefox**: 85+
- **Safari**: 14+
- **Edge**: 88+

### Required Features
- CSS Grid and Flexbox support
- ES6+ JavaScript features
- HTML5 Drag and Drop API
- CSS backdrop-filter support (optional, graceful fallback)

## 📱 Mobile Experience

### Touch Controls
- **Drag & Drop**: Smooth touch interactions
- **Tap Actions**: Alternative to dragging for card moves
- **Responsive Layout**: Rules panels stack vertically
- **Optimized Sizing**: Cards scale appropriately for touch screens

### Performance
- **Smooth Scrolling**: Optimized for mobile browsers
- **Battery Efficient**: Minimal resource usage
- **Fast Loading**: No external dependencies
- **Offline Capable**: Works without internet connection

## 🎮 Advanced Features

### Solitaire Auto-Play Intelligence
- **Strategic Thinking**: Prioritizes moves that advance game state
- **Adaptive Behavior**: Learns from game state to make optimal choices
- **Educational Tool**: Shows players how to think about moves
- **Anti-Loop Protection**: Sophisticated cycle detection

### Blackjack Realism
- **Casino Rules**: Authentic blackjack gameplay
- **Proper Payouts**: 3:2 for blackjack, 1:1 for regular wins
- **Dealer Behavior**: Follows standard casino dealer rules
- **Bankroll Management**: Realistic chip system with betting limits

## 🚀 Future Enhancements

### Potential Additions
- **Sound Effects**: Audio feedback for actions
- **Statistics Tracking**: Detailed win/loss records
- **Multiple Solitaire Variants**: Spider, FreeCell, Pyramid
- **Tournament Mode**: Timed challenges and scoring
- **Themes**: Additional visual themes and card backs
- **Multiplayer**: Online blackjack with multiple players

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for bugs, feature requests, or improvements.

---

**Enjoy playing these premium card games!** 🎴✨
