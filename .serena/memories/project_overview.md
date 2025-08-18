# Tattoo Site Project Overview

## Project Purpose
This is a tattoo coloring page generation website that allows users to create custom tattoo designs using AI. Users can input text prompts to generate tattoo images, customize various parameters, and download the results.

## Tech Stack
- **Frontend**: React with TypeScript, Vite build tool
- **Styling**: Tailwind CSS
- **Backend**: Node.js with Express
- **Database**: MySQL
- **File Storage**: MinIO object storage
- **AI Integration**: Replicate API for image generation
- **Authentication**: JWT-based auth system
- **Payment**: PayPal integration

## Key Features
- Text-to-image tattoo generation
- User authentication and credit system
- Image customization (color/black&white, quantity)
- Download capabilities (PNG/PDF)
- User gallery and history
- Multilingual support (EN/ZH)
- Responsive design

## Development Commands
- **Frontend Dev**: `npm run dev` (in frontend directory)
- **Backend Dev**: `npm run dev` (in backend directory)
- **Build**: `npm run build`
- **Test DB**: `npm run test:db`
- **Test MinIO**: `npm run test:minio`

## Project Structure
- `/frontend` - React TypeScript frontend
- `/backend` - Node.js Express backend
- `/reference` - Reference materials/docs