import { Travel } from '@/constants/types';
import { supabase } from './supabase';

/**
 * Create a new travel in the database
 */
export async function createTravel(
  travel: Omit<Travel, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Travel> {
  const { data, error } = await supabase
    .from('travels')
    .insert({
      user_id: travel.userId,
      title: travel.title,
      description: travel.description || null,
      destination: travel.destination,
      start_date: travel.startDate,
      end_date: travel.endDate,
      status: travel.status || 'planned',
      latitude: travel.latitude || null,
      longitude: travel.longitude || null,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return {
    id: data.id,
    userId: data.user_id,
    title: data.title,
    description: data.description,
    destination: data.destination,
    startDate: data.start_date,
    endDate: data.end_date,
    status: data.status,
    latitude: data.latitude ? parseFloat(data.latitude) : undefined,
    longitude: data.longitude ? parseFloat(data.longitude) : undefined,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

/**
 * Get all travels for the current user
 */
export async function getTravels(userId: string): Promise<Travel[]> {
  const { data, error } = await supabase
    .from('travels')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data.map((item) => ({
    id: item.id,
    userId: item.user_id,
    title: item.title,
    description: item.description,
    destination: item.destination,
    startDate: item.start_date,
    endDate: item.end_date,
    status: item.status,
    latitude: item.latitude ? parseFloat(item.latitude) : undefined,
    longitude: item.longitude ? parseFloat(item.longitude) : undefined,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  }));
}

