# Smart Kitchen – Recipe Generator from Your Ingredients

## Overview

Smart Kitchen is a web application built with Angular (frontend) and Django REST Framework (backend). It helps users manage pantry ingredients and discover recipes they can make with what they already have.

The main goal is to reduce food waste and simplify meal planning by letting users add ingredients, view matching recipes, and manage pantry items in one place.

## Key Features

- User authentication with JWT tokens
- Pantry ingredient tracking
- Recipe browsing, creation, and editing
- Recipe suggestions based on available pantry items
- Image and PDF support for recipe media

## Project Structure

- `backend/` – Django REST API, authentication, models, serializers, and views
- `frontend/` – Angular application for the user interface
- `aiven/` – certificate and connection files used for the MySQL/Aiven database
- `media/recipes/` – uploaded recipe images and PDF files

## Prerequisites

- Python 3.12+ (or compatible)
- Node.js and npm
- Git (optional)
- Windows PowerShell (for the provided `setup.bat`)

## Backend Setup

1. Open PowerShell at the repository root.
2. Run `setup.bat` to create the virtual environment and install Python dependencies:
   ```powershell
   .\setup.bat
   ```
3. Activate the virtual environment:
   ```powershell
   .\.venv\Scripts\Activate.ps1
   ```
4. Verify or create the backend environment file at `backend/.env` containing:
   ```text
   SECRET_KEY="your-secret-key"
   NAME="your-database-name"
   USER="your-database-user"
   PASSWORD="your-database-password"
   HOST="your-database-host"
   PORT="your-database-port"
   CA="path/to/ca.pem"
   ```
5. Run Django migrations from `backend/`:
   ```powershell
   cd backend
   python manage.py migrate
   ```
6. Start the backend server:
   ```powershell
   python manage.py runserver
   ```

## Frontend Setup

1. Open a terminal in `frontend/`:
   ```powershell
   cd frontend
   ```
2. Install dependencies:
   ```powershell
   npm install
   ```
3. Run the Angular development server:
   ```powershell
   npm start
   ```
4. Open the app in your browser at `http://localhost:4200`

## Notes

- The Django backend uses CORS with `CORS_ALLOW_ALL_ORIGINS = True`, so the Angular frontend can connect to the API during local development.
- The backend database configuration is driven by `backend/.env`.
- Media files are served from `backend/media/` when the Django development server is running.

## Useful Commands

- Run backend tests: `cd backend && python manage.py test`
- Build frontend for production: `cd frontend && npm run build`
- Start frontend in watch mode: `cd frontend && npm run watch`

## Contact

If you need help with setup or want to add new features, please open an issue or update this README with the latest instructions.
