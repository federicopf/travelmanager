import * as SQLite from 'expo-sqlite';

const DATABASE_NAME = 'travel-manager.db';
const DATABASE_VERSION = 1;

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
