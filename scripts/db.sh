#!/bin/bash
set -eo pipefail

# pg_dump -F c -b -v -f "turbo_db_2024_10_24.dump" -d turbo -U turbo
# createdb -h postgres -p 5432 -U postgres turbo
pg_restore \
    -h postgres \
    -p 5432 \
    -U postgres \
    -F c \
    -d turbo \
    -v \
    -c \
    --no-owner \
    --no-privileges \
    --no-tablespaces \
    /workspaces/turbotelescope.net/scripts/turbo_db_2024_10_24.dump

psql "postgresql://postgres:password@postgres:5432/turbo" -c "CREATE ROLE turbogroup;"
