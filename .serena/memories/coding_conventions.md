# Coding Conventions and Style Guide

## TypeScript/React Conventions
- **File Extensions**: `.tsx` for React components, `.ts` for utilities
- **Component Naming**: PascalCase for components (e.g., `GenerateLeftSidebar`)
- **Function Naming**: camelCase for functions and variables
- **Interface Naming**: PascalCase with descriptive names (e.g., `GenerateLeftSidebarProps`)
- **Hook Naming**: Use `use` prefix (e.g., `useGeneratePage`)

## Code Organization
- **Components**: Organized by feature in `/src/components/[feature]/`
- **Services**: API services in `/src/services/`
- **Hooks**: Custom hooks in `/src/hooks/`
- **Types**: Type definitions in service files and component files
- **Utilities**: Helper functions in `/src/utils/`

## State Management
- **Local State**: React useState for component-specific state
- **Global State**: React Context for app-wide state (Auth, Language, Loading)
- **Custom Hooks**: For complex state logic and API interactions

## API Patterns
- **Error Handling**: Custom ApiError class with error codes
- **Response Types**: Strongly typed API response interfaces
- **Loading States**: Consistent loading state management
- **Progress Tracking**: Real-time progress updates for async operations

## Naming Patterns
- **API Endpoints**: RESTful patterns (`/api/resource/action`)
- **Component Props**: Descriptive prop names with proper TypeScript types
- **Event Handlers**: `handle` prefix (e.g., `handleGenerate`, `handlePromptChange`)
- **State Setters**: `set` prefix (e.g., `setSelectedQuantity`)

## UI/UX Patterns
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints
- **Loading States**: Skeleton screens and progress indicators
- **Error States**: User-friendly error messages with retry options
- **Dark Theme**: Consistent dark color scheme throughout