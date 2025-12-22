# PostgreSQL Setup Guide for Yamini Infotech

This guide will help you set up PostgreSQL database for the Yamini Infotech application.

## Step 1: Install PostgreSQL

### macOS (using Homebrew)
```bash
brew install postgresql@15
brew services start postgresql@15
```

### Ubuntu/Debian
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Windows
Download and install from: https://www.postgresql.org/download/windows/

## Step 2: Create Database

### Option A: Using Command Line

```bash
# Login to PostgreSQL as postgres user
psql -U postgres

# Create the database
CREATE DATABASE yamini_infotech;

# Create a user (optional - if you want a dedicated user)
CREATE USER yamini_user WITH PASSWORD 'your_secure_password';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE yamini_infotech TO yamini_user;

# Exit psql
\q
```

### Option B: Using pgAdmin (GUI)

1. Open pgAdmin
2. Right-click on "Databases"
3. Select "Create" -> "Database"
4. Enter name: `yamini_infotech`
5. Click "Save"

## Step 3: Configure Database Connection

### Update `.env` file in backend directory:

```env
# Using default postgres user
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/yamini_infotech

# OR using custom user
DATABASE_URL=postgresql://yamini_user:your_secure_password@localhost:5432/yamini_infotech
```

### Environment Variable Format:
```
postgresql://[username]:[password]@[host]:[port]/[database_name]
```

- **username**: PostgreSQL user (default: postgres)
- **password**: User password
- **host**: Database server address (default: localhost)
- **port**: PostgreSQL port (default: 5432)
- **database_name**: yamini_infotech

## Step 4: Install Python PostgreSQL Driver

```bash
cd backend
pip install psycopg2-binary python-dotenv
```

## Step 5: Initialize Database

```bash
cd backend
python init_db.py
```

This will:
- ✅ Create all tables
- ✅ Check if database is empty
- ✅ If empty, seed with demo users and sample data
- ✅ Display initial login credentials

## Step 6: Verify Database

### Check tables were created:

```bash
psql -U postgres -d yamini_infotech

# List all tables
\dt

# Check users table
SELECT username, role, email FROM users;

# Exit
\q
```

## Troubleshooting

### Issue: "peer authentication failed"

**Solution:** Edit `pg_hba.conf`:

```bash
# Find config file location
psql -U postgres -c "SHOW hba_file;"

# Edit the file (use sudo if needed)
sudo nano /path/to/pg_hba.conf

# Change this line:
local   all   postgres   peer

# To:
local   all   postgres   md5

# Restart PostgreSQL
sudo systemctl restart postgresql  # Linux
brew services restart postgresql@15  # macOS
```

### Issue: "database does not exist"

**Solution:** Create the database first:
```bash
psql -U postgres -c "CREATE DATABASE yamini_infotech;"
```

### Issue: "password authentication failed"

**Solution:** Reset postgres password:
```bash
sudo -u postgres psql
ALTER USER postgres PASSWORD 'new_password';
\q
```

Then update your `.env` file with the new password.

### Issue: "could not connect to server"

**Solution:** Make sure PostgreSQL is running:
```bash
# macOS
brew services list
brew services start postgresql@15

# Linux
sudo systemctl status postgresql
sudo systemctl start postgresql

# Windows
# Check services in Task Manager or run:
net start postgresql-x64-15
```

## Database Management

### Backup Database
```bash
pg_dump -U postgres yamini_infotech > backup.sql
```

### Restore Database
```bash
psql -U postgres yamini_infotech < backup.sql
```

### Reset Database (Delete all data)
```bash
psql -U postgres yamini_infotech -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
python init_db.py
```

## Security Best Practices

1. **Change default passwords**: Never use default passwords in production
2. **Use strong passwords**: Minimum 12 characters with mixed case, numbers, symbols
3. **Limit network access**: Configure `pg_hba.conf` to allow only trusted IPs
4. **Use SSL/TLS**: Enable SSL for encrypted connections
5. **Regular backups**: Schedule automated database backups
6. **Update PostgreSQL**: Keep PostgreSQL updated to latest stable version

## Production Deployment

For production, consider:

1. **Managed Database Service**: 
   - AWS RDS for PostgreSQL
   - Google Cloud SQL
   - Azure Database for PostgreSQL
   - DigitalOcean Managed Databases

2. **Connection Pooling**: Use PgBouncer for better performance

3. **Monitoring**: Set up database monitoring and alerts

4. **Separate read replicas**: For high-traffic applications

## Support

If you encounter issues:
- Check PostgreSQL logs: `/var/log/postgresql/`
- Review error messages carefully
- Verify network connectivity
- Ensure PostgreSQL service is running
- Check firewall settings
