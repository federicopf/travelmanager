import * as SQLite from 'expo-sqlite';

const DATABASE_NAME = 'travel-manager.db';
const DATABASE_VERSION = 4;

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function migrateDatabase(database: SQLite.SQLiteDatabase): Promise<void> {
  const versionRow = await database.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const currentVersion = versionRow?.user_version ?? 0;

  if (currentVersion >= DATABASE_VERSION) {
    return;
  }

  if (currentVersion === 0) {
    await database.withTransactionAsync(async () => {
      await database.execAsync(`
        CREATE TABLE IF NOT EXISTS past_trips (
        id TEXT PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        start_date TEXT,
        end_date TEXT,
        date_precision TEXT NOT NULL DEFAULT 'unknown',
        cover_photo_uri TEXT,
        notes TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        deleted_at TEXT,
        version INTEGER NOT NULL DEFAULT 1
      );

      CREATE TABLE IF NOT EXISTS visited_places (
        id TEXT PRIMARY KEY NOT NULL,
        trip_id TEXT REFERENCES past_trips(id) ON DELETE SET NULL,
        title TEXT NOT NULL,
        description TEXT,
        category TEXT NOT NULL,
        custom_category TEXT,
        country_code TEXT NOT NULL,
        country_name TEXT NOT NULL,
        region TEXT,
        locality TEXT,
        address_label TEXT,
        latitude REAL,
        longitude REAL,
        geometry_type TEXT NOT NULL DEFAULT 'point',
        visited_at TEXT,
        visit_end_date TEXT,
        date_precision TEXT NOT NULL DEFAULT 'unknown',
        rating INTEGER,
        favorite INTEGER NOT NULL DEFAULT 0,
        would_return INTEGER,
        tags_json TEXT NOT NULL DEFAULT '[]',
        notes TEXT,
        cover_photo_uri TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        deleted_at TEXT,
        version INTEGER NOT NULL DEFAULT 1
      );

      CREATE INDEX IF NOT EXISTS idx_visited_places_date
        ON visited_places(visited_at DESC);
      CREATE INDEX IF NOT EXISTS idx_visited_places_country
        ON visited_places(country_code);
      CREATE INDEX IF NOT EXISTS idx_visited_places_category
        ON visited_places(category);
      CREATE INDEX IF NOT EXISTS idx_visited_places_trip
        ON visited_places(trip_id);

      CREATE TABLE IF NOT EXISTS local_photos (
        id TEXT PRIMARY KEY NOT NULL,
        visited_place_id TEXT NOT NULL REFERENCES visited_places(id) ON DELETE CASCADE,
        local_uri TEXT NOT NULL,
        width INTEGER,
        height INTEGER,
        taken_at TEXT,
        caption TEXT,
        is_cover INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        deleted_at TEXT,
        version INTEGER NOT NULL DEFAULT 1
      );

      CREATE INDEX IF NOT EXISTS idx_local_photos_place
        ON local_photos(visited_place_id);

        PRAGMA user_version = 1;
      `);
    });
  }

  if (currentVersion < 2) {
    const columns = await database.getAllAsync<{ name: string }>('PRAGMA table_info(past_trips)');
    const hasParentTrip = columns.some((column) => column.name === 'parent_trip_id');

    await database.withTransactionAsync(async () => {
      if (!hasParentTrip) {
        await database.execAsync(
          'ALTER TABLE past_trips ADD COLUMN parent_trip_id TEXT REFERENCES past_trips(id) ON DELETE SET NULL'
        );
      }
      await database.execAsync(
        'CREATE INDEX IF NOT EXISTS idx_past_trips_parent ON past_trips(parent_trip_id)'
      );
      await database.execAsync('PRAGMA user_version = 2');
    });
  }


  if (currentVersion < 3) {
    await database.withTransactionAsync(async () => {
      await database.execAsync(`
        UPDATE visited_places
        SET category = CASE
          WHEN category IN ('city', 'village', 'trekking', 'experience', 'other') THEN category
          WHEN category IN ('trail', 'mountain') THEN 'trekking'
          ELSE 'other'
        END;
        PRAGMA user_version = 3;
      `);
    });
  }

  if (currentVersion < 4) {
    const placeColumns = await database.getAllAsync<{ name: string }>('PRAGMA table_info(visited_places)');
    const hasCustomEmoji = placeColumns.some((column) => column.name === 'custom_category_emoji');

    await database.withTransactionAsync(async () => {
      if (!hasCustomEmoji) {
        await database.execAsync('ALTER TABLE visited_places ADD COLUMN custom_category_emoji TEXT');
      }
      await database.execAsync(`
        CREATE TABLE IF NOT EXISTS custom_categories (
          name TEXT PRIMARY KEY COLLATE NOCASE NOT NULL,
          emoji TEXT NOT NULL,
          created_at TEXT NOT NULL
        );
        INSERT OR IGNORE INTO custom_categories (name, emoji, created_at)
        SELECT custom_category, COALESCE(custom_category_emoji, '📍'), updated_at
        FROM visited_places
        WHERE category = 'other' AND custom_category IS NOT NULL;
        PRAGMA user_version = 4;
      `);
    });
  }
}

async function openDatabase(): Promise<SQLite.SQLiteDatabase> {
  const database = await SQLite.openDatabaseAsync(DATABASE_NAME);
  await database.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
  await migrateDatabase(database);
  return database;
}

export function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!databasePromise) {
    databasePromise = openDatabase().catch((error) => {
      databasePromise = null;
      throw error;
    });
  }

  return databasePromise;
}
