# Database Folder

This folder contains database-related information for the Sorting Visualizer project.

## MongoDB Setup

The backend uses MongoDB to store the history of sorting sessions.

### Default configuration
- `MONGO_URI` defaults to `mongodb://127.0.0.1:27017`
- `MONGO_DB_NAME` defaults to `sortingVisualizer`
- `MONGO_COLLECTION` defaults to `history`

### Running locally
1. Start MongoDB locally:
   ```bash
   mongod --dbpath /path/to/your/db
   ```
2. Start the backend server from the `backend` folder:
   ```bash
   npm start
   ```

### Environment variables
You can override configuration by setting:
- `MONGO_URI`
- `MONGO_DB_NAME`
- `MONGO_COLLECTION`
- `PORT`

Example:
```bash
MONGO_URI="mongodb://127.0.0.1:27017" npm start
```
