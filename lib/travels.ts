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

/**
 * Get a single travel by ID
 */
export async function getTravel(travelId: string): Promise<Travel | null> {
  const { data, error } = await supabase
    .from('travels')
    .select('*')
    .eq('id', travelId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
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
 * Update an existing travel
 */
export async function updateTravel(
  travelId: string,
  updates: Partial<Omit<Travel, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
): Promise<Travel> {
  const updateData: any = {};
  
  if (updates.title !== undefined) updateData.title = updates.title;
  if (updates.description !== undefined) updateData.description = updates.description || null;
  if (updates.destination !== undefined) updateData.destination = updates.destination;
  if (updates.startDate !== undefined) updateData.start_date = updates.startDate;
  if (updates.endDate !== undefined) updateData.end_date = updates.endDate;
  if (updates.status !== undefined) updateData.status = updates.status;
  if (updates.latitude !== undefined) updateData.latitude = updates.latitude || null;
  if (updates.longitude !== undefined) updateData.longitude = updates.longitude || null;

  const { data, error } = await supabase
    .from('travels')
    .update(updateData)
    .eq('id', travelId)
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
 * Delete a travel
 */
export async function deleteTravel(travelId: string): Promise<void> {
  const { error } = await supabase
    .from('travels')
    .delete()
    .eq('id', travelId);

  if (error) {
    throw error;
  }
}

