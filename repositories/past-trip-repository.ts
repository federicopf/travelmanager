import * as Crypto from 'expo-crypto';

import { CreatePastTripInput, PastTrip } from '@/domain/past-trip';
import { DatePrecision } from '@/domain/visited-place';
import { getDatabase } from '@/lib/database';

interface PastTripRow {
  id: string;
  title: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  date_precision: DatePrecision;
  cover_photo_uri: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  version: number;
  places_count: number;
  countries_count: number;
}

function optionalText(value?: string): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function rowToPastTrip(row: PastTripRow): PastTrip {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    startDate: row.start_date ?? undefined,
    endDate: row.end_date ?? undefined,
    datePrecision: row.date_precision,
    coverPhotoUri: row.cover_photo_uri ?? undefined,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at ?? undefined,
    version: row.version,
    placesCount: row.places_count,
    countriesCount: row.countries_count,
  };
}

const TRIP_SELECT = `SELECT
  trip.*,
  COUNT(place.id) AS places_count,
  COUNT(DISTINCT place.country_code) AS countries_count
FROM past_trips trip
LEFT JOIN visited_places place
  ON place.trip_id = trip.id AND place.deleted_at IS NULL`;

export async function createPastTrip(input: CreatePastTripInput): Promise<PastTrip> {
  const database = await getDatabase();
  const id = Crypto.randomUUID();
  const now = new Date().toISOString();

  await database.runAsync(
    `INSERT INTO past_trips (
      id, title, description, start_date, end_date, date_precision,
      notes, created_at, updated_at, version
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
    id,
    input.title.trim(),
    optionalText(input.description),
    input.startDate ?? null,
    input.endDate ?? null,
    input.datePrecision,
    optionalText(input.notes),
    now,
    now
  );

  const trip = await getPastTrip(id);
  if (!trip) throw new Error('Il viaggio e stato salvato ma non puo essere riletto');
  return trip;
}

export async function updatePastTrip(id: string, input: CreatePastTripInput): Promise<PastTrip> {
  const database = await getDatabase();
  const now = new Date().toISOString();

  await database.runAsync(
    `UPDATE past_trips SET
      title = ?, description = ?, start_date = ?, end_date = ?, date_precision = ?,
      notes = ?, updated_at = ?, version = version + 1
     WHERE id = ? AND deleted_at IS NULL`,
    input.title.trim(),
    optionalText(input.description),
    input.startDate ?? null,
    input.endDate ?? null,
    input.datePrecision,
    optionalText(input.notes),
    now,
    id
  );

  const trip = await getPastTrip(id);
  if (!trip) throw new Error('Il viaggio da modificare non esiste');
  return trip;
}

export async function getPastTrips(): Promise<PastTrip[]> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<PastTripRow>(
    `${TRIP_SELECT}
     WHERE trip.deleted_at IS NULL
     GROUP BY trip.id
     ORDER BY COALESCE(trip.start_date, trip.created_at) DESC, trip.created_at DESC`
  );
  return rows.map(rowToPastTrip);
}

export async function getPastTrip(id: string): Promise<PastTrip | null> {
  const database = await getDatabase();
  const row = await database.getFirstAsync<PastTripRow>(
    `${TRIP_SELECT}
     WHERE trip.id = ? AND trip.deleted_at IS NULL
     GROUP BY trip.id`,
    id
  );
  return row ? rowToPastTrip(row) : null;
}

export async function deletePastTrip(id: string): Promise<void> {
  const database = await getDatabase();
  const now = new Date().toISOString();

  await database.withTransactionAsync(async () => {
    await database.runAsync(
      `UPDATE visited_places
       SET trip_id = NULL, updated_at = ?, version = version + 1
       WHERE trip_id = ? AND deleted_at IS NULL`,
      now,
      id
    );
    await database.runAsync(
      `UPDATE past_trips
       SET deleted_at = ?, updated_at = ?, version = version + 1
       WHERE id = ? AND deleted_at IS NULL`,
      now,
      now,
      id
    );
  });
}
