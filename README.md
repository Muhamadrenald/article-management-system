# Hi Everyone, I'm Renald 👋

# Next.js | TypeScript | Tailwind CSS + Shadcn/ui

This is an Article Management System web project that I made myself. This web application provides a complete solution for managing articles and categories with both public and admin interfaces.

## 🔗 Features

### Public Features

- **Article Listing**: Browse all published articles with pagination (9 items per page)
- **Article Search**: Search articles with debounced input (300-500ms)
- **Category Filtering**: Filter articles by category
- **Article Detail**: View complete article content with related articles
- **Related Articles**: Display up to 3 articles from the same category
- **Responsive Design**: Optimized for all device sizes

### Admin Features

- **Authentication System**
  - Login with form validation
  - Register with form validation
  - Auto-redirect to article list after successful login/register
  - Logout with redirect to login page
- **Category Management**
  - List all categories with pagination (10 items per page)
  - Search categories with debounce (300-500ms)
  - Create new categories with form validation
  - Edit existing categories with form validation
- **Article Management**
  - List all articles with pagination (10 items per page)
  - Filter articles by category
  - Search articles with debounce (300-500ms)
  - Create new articles with form validation and preview
  - Edit existing articles with form validation and preview
- **Admin Dashboard**: Comprehensive management interface

## 🔗 Technologies & Dependencies

- **Next.js**: React framework with App Router, SSR and CSR capabilities
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **Shadcn/ui**: Modern component library built on Radix UI and Tailwind CSS
- **Axios**: Promise-based HTTP client for API requests
- **React Hook Form**: Performant forms library with easy validation
- **Zod**: TypeScript-first schema validation library
- **Lucide React**: Beautiful & consistent icon library
- **TypeScript**: Type-safe JavaScript development

## API Integration

The application integrates with a RESTful API for:

- User authentication
- Article CRUD operations
- Category management
- File uploads for article images

## Demo

http://localhost:3000/

## Run Locally

Clone the project

```bash
git clone https://github.com/username/article-management-system
```

Go to the project directory

```bash
cd article-management-system
```

Install dependencies

```bash
npm install
```

Set up environment variables

```bash
buat file .env
simpan https://test-fe.mysellerpintar.com/api ke dalam file .env
```

Start the development server

```bash
npm run dev
```

## Feedback

If you have any feedback, please reach out to us at avryso@gmail.com
