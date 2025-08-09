# Tank O - Software Architecture Document

## Overview
Tank O is a real-time multiplayer tank battle game built with a modern web technology stack. The architecture follows a client-server model with Angular frontend, Phaser game engine, and Node.js backend with Socket.IO for real-time communication.

---

## System Architecture

### High-Level Architecture Diagram
```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT SIDE                              │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐    ┌─────────────────────────────────┐ │
│  │   Angular App   │────│        Phaser Game Engine      │ │
│  │                 │    │                                 │ │
│  │ • UI Components │    │ • Game Scenes                  │ │
│  │ • State Mgmt    │    │ • Entity System                │ │
│  │ • Services      │    │ • Physics Engine               │ │
│  │ • Routing       │    │ • Asset Management             │ │
│  └─────────────────┘    └─────────────────────────────────┘ │
│           │                            │                   │
│           └──────────┬─────────────────┘                   │
│                      │                                     │
│              ┌───────────────────┐                         │
│              │  Event Bus System │                         │
│              │                   │                         │
│              │ • PhaserAngular   │                         │
│              │   EventBus        │                         │
│              │ • SocketEventBus  │                         │
│              └───────────────────┘                         │
└─────────────────────────────────────────────────────────────┘
                       │
                 ┌─────────────┐
                 │ WebSocket   │
                 │ Socket.IO   │
                 └─────────────┘
                       │
┌─────────────────────────────────────────────────────────────┐
│                    SERVER SIDE                              │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐    ┌─────────────────────────────────┐ │
│  │   Express.js    │    │        Socket.IO Server         │ │
│  │                 │    │                                 │ │
│  │ • REST API      │    │ • Real-time Communication      │ │
│  │ • Static Files  │    │ • Lobby Management              │ │
│  │ • Middleware    │    │ • Game State Sync              │ │
│  │ • CORS Setup    │    │ • Event Broadcasting           │ │
│  └─────────────────┘    └─────────────────────────────────┘ │
│                                    │                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Game Logic Layer                       │   │
│  │                                                     │   │
│  │ • Lobby Management                                  │   │
│  │ • Player State Management                          │   │
│  │ • Game Session Control                             │   │
│  │ • Anti-cheat Validation                            │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## Layered Architecture

### 1. Presentation Layer (Client-Side Angular)
**Location:** `/src/app/`

**Responsibilities:**
- User interface components and routing
- User input handling and validation  
- State management for UI components
- Integration with Phaser game component

**Key Components:**
```
src/app/
├── app.component.ts           # Root Angular component
├── app.config.ts              # Angular configuration
├── app.routes.ts              # Routing configuration
├── constants/
│   └── assets-enum.ts         # Asset enumeration
└── utils/
    └── asset-utils.ts         # Asset utility functions
```

### 2. Game Engine Layer (Phaser)
**Location:** `/src/game/`

**Responsibilities:**
- Game rendering and visual effects
- Physics simulation and collision detection
- Input processing and game loop management
- Asset loading and management
- Scene management and transitions

**Architecture:**
```
src/game/
├── phaser-game.component.ts   # Angular-Phaser bridge
├── main.ts                    # Phaser game configuration
├── PhaserAngularEventBus.ts   # Communication bridge
├── constants/
│   └── GameModes.ts           # Game mode definitions
├── entities/                   # Game entities
├── managers/                   # Game managers
├── map/                        # Map system
├── scenes/                     # Phaser scenes
├── services/                   # Game services
└── utils/                      # Game utilities
```

### 3. Business Logic Layer (Game Entities & Managers)
**Location:** `/src/game/entities/`, `/src/game/managers/`

**Responsibilities:**
- Game rules and logic implementation
- Entity behavior and interactions
- Game state management
- Combat and skill systems

**Core Entities:**
- `Player.ts` - Player tank entity with stats, movement, combat
- `Enemy.ts` - AI enemy entity with behavior patterns
- `Bullet.ts` - Projectile physics and damage dealing
- `TankClass.ts` - Tank type definitions and abilities
- `TankStats.ts` - Statistical system and calculations

### 4. Communication Layer (Event Bus & Socket)
**Location:** `/src/game/services/`, `/src/game/utils/`

**Responsibilities:**
- Real-time client-server communication
- Event broadcasting and handling
- State synchronization
- Network optimization

**Key Components:**
- `SocketService.ts` - WebSocket communication management
- `SocketEventBus.ts` - Event routing for multiplayer
- `PhaserAngularEventBus.ts` - Angular-Phaser communication

### 5. Server Layer (Node.js Backend)
**Location:** `/server/`

**Responsibilities:**
- Multiplayer lobby management
- Game session coordination  
- Player state validation
- Real-time event broadcasting

**Current Structure:**
```
server/
└── server.js                 # Express + Socket.IO server
```

---

## Folder Structure & Organization

### Current Project Structure
```
tank-o/
├── src/                       # Frontend source code
│   ├── app/                   # Angular application
│   │   ├── app.component.*    # Root component
│   │   ├── app.config.ts      # App configuration
│   │   ├── app.routes.ts      # Routing configuration
│   │   ├── constants/         # Application constants
│   │   └── utils/             # Utility functions
│   │
│   ├── game/                  # Phaser game engine code
│   │   ├── constants/         # Game constants
│   │   ├── entities/          # Game entities (Player, Enemy, etc.)
│   │   ├── managers/          # Game managers (GameManager)
│   │   ├── map/               # Map system
│   │   ├── scenes/            # Phaser scenes
│   │   ├── services/          # Game services (Socket, etc.)
│   │   ├── utils/             # Game utilities
│   │   ├── main.ts            # Game entry point
│   │   └── phaser-game.component.ts # Angular-Phaser bridge
│   │
│   ├── assets/                # Static game assets
│   │   ├── audio/             # Sound effects and music
│   │   └── tank/              # Tank sprites and textures
│   │
│   ├── index.html             # HTML entry point
│   ├── main.ts                # Angular bootstrap
│   └── styles.css             # Global styles
│
├── server/                    # Backend server code
│   └── server.js              # Node.js + Express + Socket.IO
│
├── angular.json               # Angular CLI configuration
├── package.json               # Dependencies and scripts
├── tsconfig.json              # TypeScript configuration
└── README.md                  # Project documentation
```

### Recommended Enhanced Structure
```
tank-o/
├── src/
│   ├── app/                   # Angular application layer
│   ├── game/                  # Game engine layer
│   ├── shared/                # Shared types and interfaces
│   │   ├── types/
│   │   ├── interfaces/
│   │   └── enums/
│   └── assets/
│
├── server/                    # Backend application
│   ├── src/
│   │   ├── controllers/       # Request handlers
│   │   ├── services/          # Business logic
│   │   ├── models/            # Data models
│   │   ├── middleware/        # Express middleware
│   │   ├── utils/             # Server utilities
│   │   ├── config/            # Server configuration
│   │   └── types/             # TypeScript types
│   ├── tests/                 # Server tests
│   └── dist/                  # Compiled JavaScript
│
├── shared/                    # Shared code between client/server
│   ├── types/                 # Common TypeScript interfaces
│   ├── constants/             # Shared constants
│   └── utils/                 # Shared utility functions
│
├── docs/                      # Documentation
├── scripts/                   # Build and deployment scripts
└── tests/                     # End-to-end tests
```

---

## Infrastructure & Deployment Architecture

### Current Setup
- **Development Server:** Angular CLI dev server (localhost:8080)
- **Backend Server:** Node.js Express server with Socket.IO
- **Asset Serving:** Static file serving via Angular build process

### Recommended Production Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       LOAD BALANCER                        │
│                    (Nginx/CloudFlare)                      │
└─────────────────────────────┬───────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
┌───────────────┐    ┌────────────────┐    ┌───────────────┐
│   CDN/Assets  │    │  Web Server    │    │  Game Server  │
│               │    │  (Static Files)│    │  Cluster      │
│ • Images      │    │                │    │               │
│ • Audio       │    │ • HTML/CSS/JS  │    │ • Socket.IO   │
│ • Sprites     │    │ • Angular App  │    │ • Game Logic  │
└───────────────┘    └────────────────┘    └───────┬───────┘
                                                    │
                                          ┌─────────────────┐
                                          │   Redis Cache   │
                                          │                 │
                                          │ • Session Data  │
                                          │ • Lobby State   │
                                          │ • Player Cache  │
                                          └─────────────────┘
```

### Deployment Strategy
**Current:** Single server deployment
**Recommended:** Microservices with container orchestration

**Infrastructure Components:**
1. **Web Tier:** Nginx reverse proxy + static file serving
2. **Application Tier:** Node.js game server cluster
3. **Cache Tier:** Redis for session management and real-time data
4. **CDN:** Asset delivery optimization
5. **Monitoring:** Application performance monitoring

---

## Communication Patterns

### 1. Angular ↔ Phaser Communication
```typescript
// Angular to Phaser
PhaserAngularEventBus.emit('game-action', data);

// Phaser to Angular  
PhaserAngularEventBus.on('scene-ready', (scene) => {
    // Handle scene change
});
```

### 2. Client ↔ Server Communication
```typescript
// Real-time events via Socket.IO
socket.emit('join-lobby', { username, lobbyCode });
socket.on('player-joined', (playerData) => {
    // Handle new player
});

// RESTful API for persistent data
fetch('/api/user/profile')
    .then(response => response.json())
    .then(data => updateProfile(data));
```

### 3. Component Communication Patterns
- **Event Bus Pattern:** For loosely coupled communication
- **Observer Pattern:** For game state changes
- **Command Pattern:** For input handling and game actions
- **State Pattern:** For game scene management

---

## Data Flow Architecture

### Game State Management
```
User Input → Input Handler → Game Logic → State Update → Renderer
     ↑                                         ↓
     └─── Network Sync ←── Socket Events ←────┘
```

### Multiplayer Synchronization
```
Client A Action → Server Validation → Broadcast to All Clients → State Update
```

### Asset Loading Pipeline
```
Asset Manifest → Phaser Loader → Cache Storage → Runtime Access
```

---

## Security Architecture

### Client-Side Security
- Input validation and sanitization
- Rate limiting for user actions
- Asset integrity verification
- Anti-tampering measures for critical game state

### Server-Side Security
- Player action validation
- Anti-cheat detection
- DDoS protection via rate limiting
- Secure lobby code generation
- Data encryption for sensitive information

### Network Security
- WebSocket connection authentication
- Message validation and filtering
- SSL/TLS encryption for all communications
- Cross-origin resource sharing (CORS) configuration

---

## Performance Considerations

### Client-Side Optimization
- **Object Pooling:** Reuse bullet and particle objects
- **Sprite Batching:** Minimize draw calls
- **Asset Compression:** Optimized image and audio formats
- **Code Splitting:** Lazy load game scenes
- **Memory Management:** Proper cleanup of game objects

### Server-Side Optimization
- **Connection Pooling:** Efficient database connections
- **Caching Strategy:** Redis for frequently accessed data
- **Load Balancing:** Distribute game sessions across servers
- **Resource Monitoring:** CPU and memory usage tracking

### Network Optimization
- **Delta Compression:** Send only changed data
- **Update Batching:** Group multiple updates per network tick
- **Predictive Interpolation:** Smooth player movement
- **Lag Compensation:** Server-side rollback for hit detection

---

## Scalability Strategy

### Horizontal Scaling
- **Game Server Clustering:** Multiple Node.js instances
- **Database Sharding:** Distribute player data across shards
- **Regional Deployment:** Servers closer to player populations
- **Auto-scaling:** Dynamic server provisioning based on load

### Vertical Scaling
- **Server Hardware Upgrades:** CPU and RAM optimization
- **Database Performance Tuning:** Query optimization and indexing
- **Network Infrastructure:** High-bandwidth connections

---

## Technology Stack

### Frontend
- **Framework:** Angular 17.2.0
- **Game Engine:** Phaser 3.88.2
- **Language:** TypeScript 5.3.2
- **Build Tool:** Angular CLI
- **State Management:** RxJS + Angular Services

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Real-time:** Socket.IO
- **Language:** JavaScript (recommended: TypeScript)

### Development Tools
- **Package Manager:** npm
- **Version Control:** Git
- **Code Quality:** ESLint, Prettier (recommended)
- **Testing:** Jest, Cypress (recommended)

### Infrastructure (Recommended)
- **Web Server:** Nginx
- **Container:** Docker
- **Orchestration:** Kubernetes
- **Cache:** Redis
- **Database:** PostgreSQL/MongoDB
- **Monitoring:** Prometheus + Grafana
- **CDN:** CloudFlare/AWS CloudFront

---

## Future Architecture Enhancements

### Microservices Migration
```
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│   User Service  │ │   Game Service  │ │  Lobby Service  │
│                 │ │                 │ │                 │
│ • Authentication│ │ • Game Logic    │ │ • Room Mgmt     │
│ • Profile Mgmt  │ │ • Physics       │ │ • Matchmaking   │
│ • Achievements  │ │ • Anti-cheat    │ │ • Player Queue  │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

### Event-Driven Architecture
- Message queues for decoupled service communication
- Event sourcing for audit trails and state reconstruction
- CQRS pattern for read/write optimization

### Advanced Analytics
- Real-time game telemetry collection
- Player behavior analysis
- Performance metrics dashboard
- A/B testing framework for game balancing

---

*Document Version: 1.0*  
*Last Updated: 2025-08-09*  
*Next Review: When implementing major architectural changes*