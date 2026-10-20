# Anant Enterprises Admin Panel

A modern, scalable admin panel built with React, TypeScript, and Vite for managing Anant Enterprises operations.

## Features

- **Modern Tech Stack**: React 18, TypeScript, Vite, Tailwind CSS
- **UI Components**: shadcn/ui with Radix UI primitives
- **State Management**: React Query for server state, Zustand for client state
- **Forms**: Formik with Yup validation
- **Routing**: React Router v7
- **Charts**: Recharts for data visualization
- **Rich Text Editor**: React Quill
- **Responsive Design**: Mobile-first approach

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview

```bash
npm run preview
```

## Project Structure

```
src/
├── components/          # Reusable UI components
├── features/           # Feature-based modules
│   ├── auth/          # Authentication
│   ├── dashboard/     # Dashboard
│   ├── products/      # Product management
│   ├── orders/        # Order management
│   ├── customers/     # Customer management
│   └── collections/   # Collection management
├── layouts/           # Layout components
├── lib/               # Core utilities and configuration
│   ├── api/          # HTTP client and API services
│   ├── config/       # App configuration
│   ├── constants/    # Application constants
│   └── utils/        # Utility functions
├── hooks/            # Custom React hooks
└── shared/           # Shared components and utilities
```

## Tech Stack

- **Frontend**: React 18, TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS, shadcn/ui
- **State Management**: React Query, Zustand
- **Forms**: Formik, Yup
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Charts**: Recharts
- **Rich Text**: React Quill

## Development Guidelines

### Code Style

- Use TypeScript for type safety
- Follow React best practices
- Use functional components with hooks
- Implement proper error handling
- Write meaningful commit messages

### File Naming

- Components: PascalCase (e.g., `UserProfile.tsx`)
- Hooks: camelCase with `use` prefix (e.g., `useAuth.ts`)
- Utils: camelCase (e.g., `formatDate.ts`)
- Types: PascalCase with `Type` suffix (e.g., `UserType.ts`)

### API Integration

- Use the centralized HTTP client in `lib/api/`
- Implement proper error handling
- Use React Query for server state management
- Follow RESTful API conventions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is private and proprietary to Anant Enterprises.
