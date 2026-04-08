## Local MongoDB (for MongoDB Compass)

This repo currently uses **Supabase** for data, but you can run a **local MongoDB** for development/testing and connect to it using **MongoDB Compass**.

### Start MongoDB

```bash
docker compose up -d
```

### Connect with MongoDB Compass

Use this connection string in Compass:

`mongodb://admin:admin@localhost:27017/?authSource=admin`

Database name (optional): `cmu_lost_and_found`

### Stop MongoDB

```bash
docker compose down
```

### Reset MongoDB data (deletes local DB files)

```bash
docker compose down -v
```
