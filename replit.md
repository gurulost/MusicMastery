# Overview

This is a comprehensive music theory learning application designed for AP Music Theory exam preparation. The app features an interactive piano keyboard interface covering 2.5 octaves where users can learn and practice major scales, minor scales, and various musical intervals. It includes both learning and practice modes, tracks user progress with detailed analytics, provides real-time feedback, and offers a complete educational experience with explanations, hints, and audio playback.

# Recent Changes

**August 27, 2025:**
- ✓ Expanded piano keyboard to cover 2.5 octaves (half octave below C, two full octaves from C, half octave above)
- ✓ Added toggle functionality - users can click keys to select/unselect them
- ✓ Implemented dual learning modes: "Learn Mode" (select correct notes) and "Practice Mode" (play in sequence)
- ✓ Enhanced educational design with comprehensive explanations, hints, and musical theory context
- ✓ Added dedicated interval practice page with detailed interval explanations
- ✓ Improved progress tracking to handle 37 total items (12 major + 12 minor + 13 intervals)
- ✓ Enhanced user interface with better visual feedback and educational content
- ✓ Added audio playbook for intervals and scales

# User Preferences

Preferred communication style: Simple, everyday language.
Learning Focus: Comprehensive AP Music Theory preparation with both teaching and practice components.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite for development and building
- **Routing**: Wouter for client-side routing with pages for home, scales, intervals, and progress
- **State Management**: TanStack Query for server state management and caching
- **UI Framework**: shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling
- **Audio**: Custom Web Audio API implementation for piano sound synthesis
- **Styling**: Tailwind CSS with custom CSS variables for theming and a "new-york" design system

## Backend Architecture
- **Runtime**: Node.js with Express.js server
- **API Design**: RESTful JSON API with routes for progress tracking and exercise sessions
- **Development**: Hot module replacement with Vite middleware integration
- **Error Handling**: Centralized error middleware with structured JSON responses
- **Logging**: Request/response logging for API endpoints with performance metrics

## Data Storage
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Schema**: Three main entities - users, progress tracking, and exercise sessions
- **Development Storage**: In-memory storage implementation for demo/development purposes
- **Migration**: Drizzle-kit for database schema management and migrations

## Authentication & User Management
- **Demo Mode**: Default demo user for immediate app access without authentication
- **User Storage**: Basic user model with username/password (prepared for future auth implementation)
- **Session Management**: Ready for session-based authentication with connect-pg-simple

## Music Theory Engine
- **Scale Generation**: Algorithmic generation of major and minor scales using interval patterns
- **Interval Calculation**: Mathematical computation of musical intervals using semitone distances
- **Note Mapping**: Chromatic note system with enharmonic equivalents
- **Exercise Logic**: Random exercise generation with progress tracking and mastery detection

## Progress Tracking System
- **Granular Tracking**: Individual progress for each scale and interval type
- **Status Management**: Three-tier system (not_started, in_progress, mastered)
- **Analytics**: Attempt counting, accuracy tracking, and time-to-completion metrics
- **Performance Metrics**: Success rate calculation and learning curve analysis

# External Dependencies

## Database & ORM
- **@neondatabase/serverless**: Serverless PostgreSQL connection for Neon database
- **drizzle-orm**: Type-safe SQL query builder and ORM
- **drizzle-zod**: Schema validation integration between Drizzle and Zod

## UI & Styling
- **@radix-ui/***: Comprehensive set of unstyled, accessible UI primitives
- **tailwindcss**: Utility-first CSS framework for rapid styling
- **class-variance-authority**: Utility for creating variant-based component APIs
- **clsx & tailwind-merge**: Conditional CSS class management

## Data Fetching & Validation
- **@tanstack/react-query**: Server state management with caching and synchronization
- **zod**: TypeScript-first schema validation library
- **@hookform/resolvers**: Form validation resolver for React Hook Form

## Development Tools
- **vite**: Fast build tool and development server
- **typescript**: Static type checking
- **@replit/vite-plugin-***: Replit-specific development enhancements for error handling and cartography

## Audio & Interaction
- **Web Audio API**: Native browser audio synthesis (no external audio libraries)
- **date-fns**: Date manipulation utilities for progress tracking timestamps