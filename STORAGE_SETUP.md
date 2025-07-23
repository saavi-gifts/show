# Storage Setup Guide

This application supports three storage backends:

## 1. File System (Local Development)
- **Default for local development**
- Stores data in `data/gifts.json`
- No setup required

## 2. Vercel KV (Recommended for Production)
- **Default on Vercel deployment**
- Persistent Redis storage
- Free tier: 30K commands/month

### Setup:
1. Go to your Vercel project dashboard
2. Navigate to Settings → Storage
3. Create a KV Database
4. Copy the connection string
5. Environment variables are automatically set

## 3. PlanetScale Database (Advanced)
- **MySQL database**
- Enable with `USE_DB=true`

### Setup:
1. Create a PlanetScale account at https://planetscale.com
2. Create a new database
3. Get connection credentials
4. Set environment variables:
   ```
   USE_DB=true
   DATABASE_HOST=your-host
   DATABASE_USERNAME=your-username  
   DATABASE_PASSWORD=your-password
   ```
5. Run the schema:
   ```sql
   -- Copy contents from src/lib/db-schema.sql
   -- Run in PlanetScale console
   ```

## Environment Variables

### Vercel KV (Default on Vercel):
- No manual setup needed

### PlanetScale:
```
USE_DB=true
DATABASE_HOST=aws.connect.psdb.cloud
DATABASE_USERNAME=your-username
DATABASE_PASSWORD=your-password
```

### Local Development:
- Uses file system by default
- No environment variables needed

## Storage Selection Logic

1. If `USE_DB=true` → PlanetScale Database
2. If on Vercel or `KV_URL` exists → Vercel KV  
3. Otherwise → File System

## Data Persistence

| Storage | Survives Deployment | Survives Restarts | Scalable |
|---------|-------------------|------------------|----------|
| File System | ❌ | ✅ | ❌ |
| Vercel KV | ✅ | ✅ | ✅ |
| PlanetScale | ✅ | ✅ | ✅ |

## Testing Storage

Check the console logs on startup to see which storage mode is active:
- `Storage mode: Database` (PlanetScale)
- `Storage mode: KV` (Vercel KV)
- `Storage mode: File System` (Local files)