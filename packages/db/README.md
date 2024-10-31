# db

## Scripts

### Copying DB

```bash
pg_dump [SOURCE_DB] >> dump.sql
psql [TARGET_DB] < ./dump.sql
```