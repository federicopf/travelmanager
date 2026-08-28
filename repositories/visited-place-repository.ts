import * as Crypto from 'expo-crypto';

import {
  CreateVisitedPlaceInput,
  DatePrecision,
  GeometryType,
  VisitedPlace,
  VisitedPlaceCategory,
  UpdateVisitedPlaceInput,
} from '@/domain/visited-place';
import { getDatabase } from '@/lib/database';
import { normalizeCountryCode } from '@/utils/country';

interface VisitedPlaceRow {
  id: string;
  trip_id: string | null;
  title: string;
  description: string | null;
  category: string;
  custom_category: string | null;
  custom_category_emoji: string | null;
  country_code: string;
  country_name: string;
  region: string | null;
  locality: string | null;
  address_label: string | null;
  latitude: number | null;
  longitude: number | null;
  geometry_type: GeometryType;
  visited_at: string | null;
  visit_end_date: string | null;
  date_precision: DatePrecision;
  rating: number | null;
  favorite: number;
  would_return: number | null;
  tags_json: string;
  notes: string | null;
  cover_photo_uri: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  version: number;
}

export interface VisitedPlaceStats {
  placesCount: number;
  countriesCount: number;
  categoriesCount: number;
}

function optionalText(value?: string): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function normalizeCategory(category: string): VisitedPlaceCategory {
  if (category === 'city' || category === 'village' || category === 'trekking' || category === 'experience') {
    return category;
  }
  if (category === 'trail' || category === 'mountain') return 'trekking';
  return 'other';
}

function rowToVisitedPlace(row: VisitedPlaceRow): VisitedPlace {
  let tags: string[] = [];

  try {
    const parsed = JSON.parse(row.tags_json);
    tags = Array.isArray(parsed) ? parsed.filter((tag): tag is string => typeof tag === 'string') : [];
  } catch {
    tags = [];
  }

  return {
    id: row.id,
    tripId: row.trip_id ?? undefined,
    title: row.title,
    description: row.description ?? undefined,
    category: normalizeCategory(row.category),
    customCategory: row.custom_category ?? undefined,
    customCategoryEmoji: row.custom_category_emoji ?? undefined,
    countryCode: row.country_code,
    countryName: row.country_name,
    region: row.region ?? undefined,
    locality: row.locality ?? undefined,
    addressLabel: row.address_label ?? undefined,
    latitude: row.latitude ?? undefined,
    longitude: row.longitude ?? undefined,
    geometryType: row.geometry_type,
    visitedAt: row.visited_at ?? undefined,
    visitEndDate: row.visit_end_date ?? undefined,
    datePrecision: row.date_precision,
    rating: row.rating ?? undefined,
    favorite: row.favorite === 1,
    wouldReturn: row.would_return === null ? undefined : row.would_return === 1,
    tags,
    notes: row.notes ?? undefined,
    coverPhotoUri: row.cover_photo_uri ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at ?? undefined,
    version: row.version,
  };
}

export async function createVisitedPlace(input: CreateVisitedPlaceInput): Promise<VisitedPlace> {
  const database = await getDatabase();
  const id = Crypto.randomUUID();
  const now = new Date().toISOString();
  const countryCode = normalizeCountryCode(input.countryCode);

  await database.runAsync(
    `INSERT INTO visited_places (
      id, trip_id, title, description, category, custom_category, custom_category_emoji, country_code, country_name,
      region, locality, address_label, latitude, longitude, geometry_type, visited_at, visit_end_date, date_precision,
      favorite, would_return, tags_json, notes, created_at, updated_at, version
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'point', ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
    id,
    input.tripId ?? null,
    input.title.trim(),
    optionalText(input.description),
    input.category,
    optionalText(input.customCategory),
    optionalText(input.customCategoryEmoji),
    countryCode,
    input.countryName.trim(),
    optionalText(input.region),
    optionalText(input.locality),
    optionalText(input.addressLabel),
    input.latitude ?? null,
    input.longitude ?? null,
    input.visitedAt ?? null,
    input.visitEndDate ?? null,
    input.datePrecision,
    input.favorite ? 1 : 0,
    input.wouldReturn === undefined ? null : input.wouldReturn ? 1 : 0,
    JSON.stringify(input.tags ?? []),
    optionalText(input.notes),
    now,
    now
  );

  const created = await getVisitedPlace(id);
  if (!created) {
    throw new Error('Il luogo e stato salvato ma non puo essere riletto');
  }

  return created;
}

export async function updateVisitedPlace(
  id: string,
  input: UpdateVisitedPlaceInput
): Promise<VisitedPlace> {
  const database = await getDatabase();
  const now = new Date().toISOString();

  await database.runAsync(
    `UPDATE visited_places SET
      trip_id = ?, title = ?, description = ?, category = ?, custom_category = ?, custom_category_emoji = ?,
      country_code = ?, country_name = ?, region = ?, locality = ?, address_label = ?, latitude = ?,
      longitude = ?, visited_at = ?, visit_end_date = ?, date_precision = ?, favorite = ?, would_return = ?,
      tags_json = ?, notes = ?, updated_at = ?, version = version + 1
     WHERE id = ? AND deleted_at IS NULL`,
    input.tripId ?? null,
    input.title.trim(),
    optionalText(input.description),
    input.category,
    optionalText(input.customCategory),
    optionalText(input.customCategoryEmoji),
    normalizeCountryCode(input.countryCode),
    input.countryName.trim(),
    optionalText(input.region),
    optionalText(input.locality),
    optionalText(input.addressLabel),
    input.latitude ?? null,
    input.longitude ?? null,
    input.visitedAt ?? null,
    input.visitEndDate ?? null,
    input.datePrecision,
    input.favorite ? 1 : 0,
    input.wouldReturn === undefined ? null : input.wouldReturn ? 1 : 0,
    JSON.stringify(input.tags ?? []),
    optionalText(input.notes),
    now,
    id
  );

  const updated = await getVisitedPlace(id);
  if (!updated) {
    throw new Error('Il luogo da modificare non esiste');
  }
  return updated;
}

export async function getVisitedPlacesByTrip(tripId: string): Promise<VisitedPlace[]> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<VisitedPlaceRow>(
    `SELECT * FROM visited_places
     WHERE trip_id = ? AND deleted_at IS NULL
     ORDER BY COALESCE(visited_at, created_at) ASC, created_at ASC`,
    tripId
  );
  return rows.map(rowToVisitedPlace);
}

export async function getVisitedPlaces(): Promise<VisitedPlace[]> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<VisitedPlaceRow>(
    `SELECT * FROM visited_places
     WHERE deleted_at IS NULL
     ORDER BY COALESCE(visited_at, created_at) DESC, created_at DESC`
  );
  return rows.map(rowToVisitedPlace);
}

export async function getVisitedPlace(id: string): Promise<VisitedPlace | null> {
  const database = await getDatabase();
  const row = await database.getFirstAsync<VisitedPlaceRow>(
    'SELECT * FROM visited_places WHERE id = ? AND deleted_at IS NULL',
    id
  );
  return row ? rowToVisitedPlace(row) : null;
}

export async function deleteVisitedPlace(id: string): Promise<void> {
  const database = await getDatabase();
  const now = new Date().toISOString();
  await database.runAsync(
    `UPDATE visited_places
     SET deleted_at = ?, updated_at = ?, version = version + 1
     WHERE id = ? AND deleted_at IS NULL`,
    now,
    now,
    id
  );
}

export async function getVisitedPlaceStats(): Promise<VisitedPlaceStats> {
  const database = await getDatabase();
  const row = await database.getFirstAsync<{
    places_count: number;
    countries_count: number;
    categories_count: number;
  }>(`SELECT
      COUNT(*) AS places_count,
      COUNT(DISTINCT country_code) AS countries_count,
      COUNT(DISTINCT category) AS categories_count
    FROM visited_places
    WHERE deleted_at IS NULL`);

  return {
    placesCount: row?.places_count ?? 0,
    countriesCount: row?.countries_count ?? 0,
    categoriesCount: row?.categories_count ?? 0,
  };
}
