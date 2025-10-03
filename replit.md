# SALMAN'S AI - Web Chat Application

## Overview

SALMAN'S AI is a web-based conversational AI assistant that provides an interactive chat interface powered by Venice AI. The application features a modern, responsive single-page design with persistent conversation history stored locally in the browser. Users can engage in natural language conversations with the AI assistant through a clean, gradient-themed interface.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Solution**: Vanilla JavaScript single-page application with no framework dependencies

The frontend uses pure HTML, CSS, and JavaScript to create a responsive chat interface:

- **Chat Interface**: Message container with auto-scrolling, user/assistant message differentiation, and typing indicators
- **Input Handling**: Auto-expanding textarea with keyboard shortcuts (Enter to send, Shift+Enter for new line)
- **State Management**: Conversation history and context memory persisted in localStorage
- **Message Processing**: UUID generation for request/message tracking, message formatting support
- **Code Copy Feature**: One-click copy buttons on all code blocks for easy code copying
- **Code Display**: Proper syntax highlighting and horizontal scrolling for long code lines

**Rationale**: Zero build tools or dependencies results in faster loading, simpler deployment, and easier maintenance. LocalStorage provides client-side persistence without requiring database infrastructure.

**Pros**: Fast, lightweight, works offline for UI, no transpilation needed
**Cons**: Limited scalability for complex state management, manual DOM manipulation

### Backend Architecture

**Solution**: Node.js Express server acting as a proxy to Venice AI API

The backend implements a minimal Express server that:

- **API Proxy**: Single `/api/chat` endpoint forwards requests to Venice AI with proper authentication headers
- **Static File Serving**: Serves frontend assets directly from the root directory
- **CORS Support**: Enables cross-origin requests for local development
- **Authentication Handling**: Manages Venice AI cookies and headers in server-side configuration

**Rationale**: Proxy architecture keeps Venice AI credentials secure on the server while allowing the frontend to remain simple and stateless. This avoids CORS issues and protects API keys from exposure in client-side code.

**Pros**: Simple deployment, credentials remain secure, minimal server-side logic
**Cons**: Server becomes a single point of failure, no request caching or rate limiting

### Data Storage

**Solution**: Browser localStorage for conversation history and context memory

All conversation data is stored client-side using the Web Storage API:

- **Conversation History**: Array of message objects stored under `salman_conversation_history` key
- **Context Memory**: Separate storage under `salman_context_memory` for maintaining conversation context
- **No Server-Side Database**: No persistence layer on backend

**Rationale**: For a personal AI assistant, client-side storage provides immediate persistence without database overhead. Each user's data remains on their device, eliminating privacy concerns and infrastructure costs.

**Pros**: Zero database costs, instant persistence, privacy-friendly
**Cons**: Data lost if localStorage is cleared, no cross-device sync, no analytics capability

### Authentication & Authorization

**Solution**: No user authentication system; anonymous access with client-generated UUIDs

The application operates without user accounts:

- **Request Identification**: Random UUIDs generated for each request/message using client-side algorithm
- **Venice AI Authentication**: Static cookies and headers configured in server.js
- **Anonymous Users**: Each session generates temporary user IDs in format `user_anon_[uuid]`

**Rationale**: For a personal/demo AI assistant, authentication adds unnecessary complexity. Venice AI authentication is handled entirely server-side through hardcoded credentials.

**Pros**: Zero friction for users, no account management overhead
**Cons**: No user-specific features, no usage tracking per user, shared Venice AI quota

## External Dependencies

### Third-Party Services

**Venice AI API**: Primary AI conversation service
- **Endpoint**: `https://outerface.venice.ai/api/inference/chat`
- **Authentication**: Cookie-based authentication with static credentials
- **Purpose**: Provides natural language understanding and response generation

### NPM Packages

**Express.js (v5.1.0)**: Web server framework
- **Purpose**: HTTP server, routing, and static file serving

**CORS (v2.8.5)**: Cross-Origin Resource Sharing middleware
- **Purpose**: Enables cross-origin requests during development

**node-fetch (v3.3.2)**: HTTP client library
- **Purpose**: Listed in dependencies but not actively used in current implementation

### Browser APIs

**LocalStorage API**: Client-side data persistence
**Fetch API**: HTTP requests from browser to backend
**Clipboard API**: One-click code copying functionality

## Developer Information

- **Developer Contact**: WhatsApp +923416647737
- **WhatsApp Link**: https://wa.me/923416647737

## Recent Changes

**October 3, 2025**: 
- Customized branding from "NGYT777GG WORM AI" to "SALMAN'S AI"
- Updated developer contact to WhatsApp number 923416647737
- Added one-click copy button functionality to all code blocks
- Enhanced code block styling with proper scrolling (overflow-x: auto)
- Updated localStorage keys to use "salman_" prefix for consistency
- Preserved all Venice AI API configuration (headers, cookies, authentication)
- Verified application running successfully on port 5000
