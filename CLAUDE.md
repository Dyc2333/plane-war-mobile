# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the Project

No build process required. Open `index.html` directly in a browser or serve with a local server:

```bash
# Python
python -m http.server 8000

# Node.js
npx http-server
```

## Architecture

This is a vanilla JavaScript HTML5 Canvas shooting game with a modular class-based architecture:

### Core Game Loop

```
loop() → input.update() → game entities update() → draw() → requestAnimationFrame
```

- **Fixed Delta Time**: Uses `dt = (timestamp - lastTime) / 1000` capped at 0.1s for consistent game physics
- **State Machine**: Game states are managed via `GameState` enum (MENU, PLAYING, PAUSED, GAMEOVER)

### Key Classes and Responsibilities

- **Game**: Main orchestrator, manages game loop, state transitions, and entity coordination
- **Player**: Handles player movement, shooting, weapons, shield, and invincibility
- **Enemy**: Enemy aircraft with three types (normal, fast, heavy) and three flight patterns (straight, wave, track)
- **BulletPool**: Object pooling pattern for bullets to reduce GC overhead
- **ItemManager**: Handles power-up drops (weapon, heal, bomb, shield)
- **ParticleSystem**: Manages explosion and visual effects
- **InputHandler**: Keyboard/mouse input with "just pressed" detection via `prevKeys` vs `keys` sets
- **Storage**: LocalStorage wrapper for high score persistence

### Input Handling Pattern

`InputHandler` tracks keys across frames:
- `isKeyPressed(key)` - key is currently down
- `isKeyJustPressed(key)` - key was just pressed (down this frame, up last frame)
- `update()` must be called each frame to sync `prevKeys` with `keys`

**Critical Note**: When game is PAUSED, `update()` was not being called, causing input state to desync. The loop now updates input even in paused state (at line 109-116 of game.js) to handle resume key detection properly.

### Collision Detection

AABB (Axis-Aligned Bounding Box) collision via `checkCollision()` in utils.js.
Hitboxes use `GAME_CONFIG.HITBOX_SCALE` (0.8) for more forgiving collisions.

### Enemy Configuration

Enemy types use lowercase in `EnemyType` enum ('normal', 'fast', 'heavy') but uppercase keys in `GAME_CONFIG.ENEMY` config. The Enemy constructor handles this conversion:
```javascript
const typeKey = this.type.toUpperCase();
const config = GAME_CONFIG.ENEMY[typeKey];
```

### Bomb Functionality

- B key triggers bomb (check both 'KeyB' code and 'B' key)
- Bomb clears all enemies and enemy bullets
- Bomb count is tracked in `game.bombCount`, items increment this via `item.applyToPlayer().bombAdded`
- Use reverse iteration when destroying enemies to avoid index issues

### Configuration

All game constants are in `js/config.js`:
- `GAME_CONFIG`: Game settings (canvas size, spawn rates, weapon levels)
- `COLORS`: Color scheme for all game entities
- `EnemyType`, `ItemType`, `WeaponType`, `FlyPattern`: Type enumerations

## Remote Repository

- URL: https://gitee.com/dyc289686387/airplane-battle.git