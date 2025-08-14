# Premium Card Games - AI Coding Instructions

## Project Architecture

This is a **pure vanilla web application** with no build tools, frameworks, or dependencies. The architecture consists of:

- **Single HTML file** (`index.html`) with complete markup for both games
- **Class-based JavaScript** (`script.js`) with two main game engines: `SolitaireGame` and `BlackjackGame`
- **Premium CSS styling** (`styles.css`) featuring glass morphism, animations, and responsive design
- **Tab-based UI** switching between Klondike Solitaire and Blackjack games

## Key Design Patterns

### Game State Management
- Each game class maintains complete state in properties: `deck`, `stock`, `waste`, `foundations`, `tableau` (Solitaire), `playerHand`/`dealerHand` (Blackjack)
- **No external state management** - all state is encapsulated within game class instances
- Game initialization follows pattern: `createDeck()` → `shuffleDeck()` → `dealCards()` → `renderGame()`

### Animation System
- **Flying card animations** use DOM cloning and absolute positioning with CSS transforms
- Pattern: Clone card → Position at source → Animate to target → Clean up clone
- Key method: `animateCardMovement(sourceCard, targetElement)` creates visual feedback
- **Invalid move feedback** shows red X indicator and returns card to source with animation

### Event-Driven Architecture
- Drag & drop uses native HTML5 API with `dragstart`, `dragover`, `drop` events
- **Event delegation** pattern for dynamic card elements
- Auto-play system uses `setInterval` with move validation and loop prevention

## Critical Workflows

### Testing Locally
```bash
# No build process - open directly in browser
open index.html
# or
python -m http.server 8000  # For local development server
```

### Adding New Features
1. **Game Logic**: Extend game classes with new methods
2. **UI Elements**: Add to existing HTML structure (avoid new files)
3. **Styling**: Append to `styles.css` following glass morphism theme
4. **Animation**: Use existing `animateCardMovement` pattern for consistency

### Debugging
- **Console logging** is extensive throughout game logic for move tracking
- **Visual highlights** show valid drop zones and selected cards
- **Game state inspection** via browser dev tools - all state is in class properties

## Project-Specific Conventions

### Card Representation
```javascript
{
    suit: 'hearts|diamonds|clubs|spades',
    rank: 'A|2|3|...|J|Q|K',
    value: 1-13,
    color: 'red|black',
    faceUp: boolean,
    id: 'suit-rank'
}
```

### Pile Structure
- **Tableau piles**: Arrays with cards stacked (last = top card)
- **Foundation piles**: Build up by suit from Ace to King
- **Stock/Waste**: Single arrays for stock pile cycling

### Animation Timing
- **Card movements**: 800ms cubic-bezier for smooth flight
- **Auto-play interval**: 2500ms to allow full animation completion
- **UI transitions**: 300ms for instant responsiveness

### CSS Architecture
- **Glass morphism** using `backdrop-filter: blur()` and transparency
- **Color scheme**: Deep blue gradient background with gold accents (`#fbbf24`)
- **Responsive breakpoints**: Single mobile breakpoint at 768px with stacked layout

## Auto-Play Intelligence

The Solitaire auto-play system demonstrates advanced game logic:

### Move Prioritization
1. **Foundation moves** (highest priority) - cards to final piles
2. **Face-down card reveals** - expose hidden cards
3. **Strategic tableau moves** - build sequences and free up cards
4. **Stock cycling** - when no other moves available

### Loop Prevention
- Tracks last 10 auto-moves in `lastAutoMoves` array
- Prevents immediate reversal of moves (e.g., card A→B then B→A)
- **Stock cycle limiting** prevents infinite stock-waste cycling

## Integration Points

### Game Switching
- **Tab system** uses `data-game` attributes and CSS class toggling
- Games share visual theme but maintain separate state
- **Rules panels** are collapsible with consistent toggle behavior

### Card Rendering
- **Dynamic DOM creation** for all cards with drag/drop attributes
- **Placeholder elements** in HTML maintain layout structure
- **Visual states**: selected, highlighted, invalid drop zones

## Development Guidelines

- **No build tools** - all code must run directly in browser
- **ES6+ classes** for game logic organization
- **Semantic HTML** with ARIA attributes for accessibility
- **Progressive enhancement** - core functionality works without advanced CSS features
- **Performance focused** - efficient DOM manipulation with minimal reflows
