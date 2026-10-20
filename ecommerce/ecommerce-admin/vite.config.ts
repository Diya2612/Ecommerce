import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Quill editor chunk
          if (id.includes('quill')) {
            return 'quill';
          }
          // Dashboard chunk
          if (id.includes('src/features/dashboard')) {
            return 'dashboard';
          }
          // Auth chunk
          if (id.includes('src/features/auth')) {
            return 'auth';
          }
          // Products chunk
          if (id.includes('src/features/products')) {
            return 'products';
          }
          // Orders chunk
          if (id.includes('src/features/orders')) {
            return 'orders';
          }
          // Customers chunk
          if (id.includes('src/features/customers')) {
            return 'customers';
          }
          // Bundles chunk
          if (id.includes('src/features/bundles')) {
            return 'bundles';
          }
          // Discounts chunk
          if (id.includes('src/features/discounts')) {
            return 'discounts';
          }
          // Gift cards chunk
          if (id.includes('src/features/giftcards')) {
            return 'giftcards';
          }
          // Notifications chunk
          if (id.includes('src/features/notifications')) {
            return 'notifications';
          }
          // Access management - split by page for better granularity
          if (id.includes('src/features/access-management/pages/AccessManagementPage')) {
            return 'access-users';
          }
          if (id.includes('src/features/access-management/pages/RolesManagementPage')) {
            return 'access-roles';
          }
          if (id.includes('src/features/access-management/pages/PermissionCataloguePage')) {
            return 'access-permissions';
          }
          // Shared access management code
          if (id.includes('src/features/access-management')) {
            return 'access-shared';
          }
          // Settings chunk
          if (id.includes('src/features/settings')) {
            return 'settings';
          }
          // Profile chunk
          if (id.includes('src/features/profile')) {
            return 'profile';
          }
          // UI libraries
          if (
            id.includes('@radix-ui') ||
            id.includes('lucide-react')
          ) {
            return 'ui';
          }
          // Form libraries
          if (
            id.includes('react-hook-form') ||
            id.includes('@hookform/resolvers') ||
            id.includes('zod')
          ) {
            return 'forms';
          }
          // Data visualization
          if (id.includes('recharts')) {
            return 'charts';
          }
          // Utilities
          if (
            id.includes('date-fns') ||
            id.includes('lodash-es') ||
            id.includes('clsx') ||
            id.includes('tailwind-merge')
          ) {
            return 'utils';
          }
        },
      },
    },
  },
})
