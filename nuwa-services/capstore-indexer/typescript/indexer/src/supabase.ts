import { createClient } from '@supabase/supabase-js';
import type { Cap } from './type.js';
import { config } from 'dotenv';
import { SUPABASE_KEY, SUPABASE_URL } from './constant.js';

config();

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export async function storeToSupabase(data: Cap, cid: string): Promise<void> {
  const { error } = await supabase
    .from('ipfs_data')
    .upsert(
      {
        name: data.name || null,
        id: data.id || null,
        cid: cid,
        timestamp: new Date().toISOString()
      },
      { onConflict: 'cid' }
    );

  if (error) {
    throw new Error(`Supabase operation failed: ${error.message}`);
  }
}

export async function queryCIDFromSupabase(
  name?: string | null,
  cid?: string | null,
  page: number = 0,
  pageSize: number = 50
): Promise<{
  success: boolean;
  items?: Array<{ cid: string; name: string; id: string}>;
  totalItems?: number;
  page?: number;
  pageSize?: number;
  totalPages?: number;
  error?: string;
}> {
  try {
    // Validate page size (max 50 records per page)
    const validatedPageSize = Math.min(pageSize, 50);

    // Calculate pagination offset
    const offset = page * validatedPageSize;

    // Create base query
    let query = supabase
      .from('ipfs_data')
      .select('cid, name, id', { count: 'exact' });

    // Add filtering conditions
    if (name) query = query.ilike('name', `%${name}%`);
    if (cid) query = query.ilike('cid', `%${cid}%`);

    // Apply pagination
    query = query.range(offset, offset + validatedPageSize - 1);

    // Execute query
    const { data, count, error } = await query;

    if (error) throw error;

    // Handle empty results
    if (!data || data.length === 0) {
      return {
        success: false,
        page,
        pageSize: validatedPageSize,
        totalItems: 0,
        totalPages: 0,
        error: 'No records found matching the criteria'
      };
    }

    // Calculate total pages
    const totalItems = count || data.length;
    const totalPages = Math.ceil(totalItems / validatedPageSize);

    return {
      success: true,
      items: data.map(item => ({
        cid: item.cid,
        name: item.name,
        id: item.id,
      })),
      totalItems,
      page,
      pageSize: validatedPageSize,
      totalPages
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown query error'
    };
  }
}