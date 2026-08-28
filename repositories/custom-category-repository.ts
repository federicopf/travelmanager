import { getDatabase } from '@/lib/database';

export interface CustomCategory {
  name: string;
  emoji: string;
}

export async function getCustomCategories(): Promise<CustomCategory[]> {
  const database = await getDatabase();
  return database.getAllAsync<CustomCategory>(
    'SELECT name, emoji FROM custom_categories ORDER BY name COLLATE NOCASE ASC'
  );
}

export async function saveCustomCategory(name: string, emoji: string): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    `INSERT INTO custom_categories (name, emoji, created_at)
     VALUES (?, ?, ?)
     ON CONFLICT(name) DO UPDATE SET emoji = excluded.emoji`,
    name.trim(),
    emoji.trim(),
    new Date().toISOString()
  );
}
