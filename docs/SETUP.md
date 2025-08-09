# Tank O - Development Setup Guide

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager
- Angular CLI (`npm install -g @angular/cli`)

## Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd tank-o
```

2. **Install dependencies**
```bash
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install
cd ..
```

3. **Development Setup**
```bash
# Start the development server (frontend)
npm run dev

# In a separate terminal, start the backend server
cd server
npm start

# Or use npm run dev-server from root directory
```

## Development Commands

### Frontend (Angular + Phaser)
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint (if configured)
npm run test         # Run unit tests (if configured)
```

### Backend (Node.js + Socket.IO)
```bash
cd server
npm start            # Start production server
npm run dev          # Start development server with nodemon
npm run test         # Run server tests
```

### Full Stack Development
```bash
# Run both frontend and backend concurrently
npm run dev:full     # If configured in package.json
```

## Project Structure

```
tank-o/
├── src/                    # Frontend source code
│   ├── app/               # Angular application
│   ├── game/              # Phaser game engine
│   ├── shared/            # Shared client-side code
│   └── assets/            # Static assets
├── server/                # Backend source code
│   ├── src/               # Server source code
│   │   ├── controllers/   # Socket event handlers
│   │   ├── services/      # Business logic services
│   │   ├── models/        # Data models
│   │   ├── middleware/    # Server middleware
│   │   ├── utils/         # Server utilities
│   │   └── config/        # Server configuration
│   └── tests/             # Server tests
├── shared/                # Code shared between client/server
├── docs/                  # Documentation
├── scripts/               # Build and deployment scripts
└── tests/                 # End-to-end tests
```

## Configuration

### Environment Variables

Create `.env` files for different environments:

**Frontend (.env)**
```
VITE_API_URL=http://localhost:3000
VITE_SOCKET_URL=http://localhost:3000
```

**Backend (server/.env)**
```
PORT=3000
NODE_ENV=development
CLIENT_URL=http://localhost:8080
LOG_LEVEL=debug
TRUST_PROXY=false
```

### Development vs Production

- **Development**: Hot reloading, detailed logging, CORS enabled for localhost
- **Production**: Optimized builds, minimal logging, proper CORS configuration

## Troubleshooting

### Common Issues

1. **Port conflicts**: Make sure ports 3000 (backend) and 8080 (frontend) are available
2. **CORS errors**: Check that CLIENT_URL environment variable matches your frontend URL
3. **Socket connection issues**: Verify backend server is running and accessible

### Debug Mode

Enable debug logging:
```bash
# Frontend
localStorage.setItem('debug', 'tank-o:*');

# Backend
LOG_LEVEL=debug npm start
```

## Testing

### Unit Tests
```bash
# Frontend tests
npm run test

# Backend tests  
cd server && npm run test
```

### Integration Tests
```bash
npm run test:integration
```

### Manual Testing Checklist

- [ ] Main menu loads correctly
- [ ] Can create and join lobbies
- [ ] Tank selection works
- [ ] Game starts and players can move/shoot
- [ ] Multiplayer synchronization works
- [ ] Disconnection handling works properly

## Contributing

1. Create feature branch from `main`
2. Make changes following project conventions
3. Run tests and ensure they pass
4. Update documentation if needed
5. Submit pull request

## Performance Tips

### Development
- Use `npm run dev-nolog` to disable analytics logging
- Close unused browser tabs to save memory
- Use Chrome DevTools Performance tab to profile game performance

### Production
- Enable gzip compression on server
- Use CDN for static assets
- Monitor server performance and scale as needed

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment instructions.