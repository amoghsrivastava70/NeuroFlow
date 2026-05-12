# Neuroflow

Neuroflow is a full-stack application featuring a modern React frontend and a robust Node.js backend.

## Project Structure

```
Neuroflow/
├── Backend/          # Node.js backend server
│   ├── services/     # Business logic and external integrations
│   ├── db.js         # Database configuration
│   └── server.js     # Main entry point
└── frontend/         # Vite + React frontend application
    ├── src/          # React components and logic
    └── index.html    # Entry HTML
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher)
- [npm](https://www.npmjs.com/)

### Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd Neuroflow
   ```

2. **Setup Backend:**
   ```bash
   cd Backend
   npm install
   # Create a .env file based on existing environment variables
   npm start
   ```

3. **Setup Frontend:**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

## Environment Variables

Ensure you have a `.env` file in the `Backend` directory with the necessary configuration (API keys, DB connection strings, etc.).

## Technologies Used

- **Frontend:** React, Vite, Tailwind CSS
- **Backend:** Node.js, Express
- **Database:** MongoDB (or as configured in db.js)
- **Styling:** CSS3, Tailwind CSS
