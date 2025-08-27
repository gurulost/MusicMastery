# Overview

This is a music theory learning application that helps users practice and master musical scales and intervals. The app features an interactive piano keyboard interface where users can practice identifying and playing major scales, minor scales, and various musical intervals. It tracks user progress, provides real-time feedback, and gamifies the learning experience with completion tracking and mastery indicators.

# User Preferences

Preferred communication style: Simple, everyday language.

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