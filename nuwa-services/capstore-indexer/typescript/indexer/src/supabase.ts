import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import {PACKAGE_ID, SUPABASE_KEY, SUPABASE_URL} from './constant.js';
import {IndexerEventIDView} from "@roochnetwork/rooch-sdk";

config();

const CAP_SYNC_TABLE_NAME = "cap_sync_state";
const CAP_TABLE_NAME = "cap_data"

function serializeCursor(cursor: IndexerEventIDView | null): string | null {
  return cursor ? JSON.stringify(cursor) : null;
}

function deserializeCursor(cursorStr: string | null): IndexerEventIDView | null {
  if (!cursorStr) return null;
  try {
    const parsed = JSON.parse(cursorStr) as IndexerEventIDView;

    if (parsed?.event_index && parsed?.tx_order) {
      return parsed;
    }
    throw new Error('Invalid cursor structure');
  } catch (e) {
    console.error('Cursor deserialization failed:', e);
    return null;
  }
}

export async function getLastCursor(): Promise<IndexerEventIDView | null> {
  try {
    const { data, error } = await supabase
      .from(CAP_SYNC_TABLE_NAME)
      .select('cursor')
      .eq('event_type', `${PACKAGE_ID}::acp_registry::RegisterEvent`)
      .order('last_updated', { ascending: false })
      .limit(1)
      .single();

    if (error || !data || !data.cursor) {
      console.warn('Cursor not found, starting from beginning:', error?.message);
      return null;
    }
    return deserializeCursor(data.cursor);
  } catch (e) {
    console.error('Error fetching cursor:', e);
    return null;
  }
}

export async function saveCursor(cursor: IndexerEventIDView | null) {
  try {
    const cursorStr = serializeCursor(cursor);
    const { error } = await supabase
      .from(CAP_SYNC_TABLE_NAME)
      .upsert(
        {
          event_type: `${PACKAGE_ID}::acp_registry::RegisterEvent`,
          cursor: cursorStr,
          last_updated: new Date()
        },
        { onConflict: 'event_type' }
      );

    if (error) throw error;
    console.log(`Cursor saved: ${cursorStr}`);
  } catch (e) {
    console.error('Error saving cursor:', e);
  }
}

export async function getLastUpdateCursor(): Promise<IndexerEventIDView | null> {
  try {
    const { data, error } = await supabase
      .from(CAP_SYNC_TABLE_NAME)
      .select('cursor')
      .eq('event_type', `${PACKAGE_ID}::acp_registry::UpdateEvent`)
      .order('last_updated', { ascending: false })
      .limit(1)
      .single();

    if (error || !data || !data.cursor) {
      console.warn('Cursor not found, starting from beginning:', error?.message);
      return null;
    }
    return deserializeCursor(data.cursor);
  } catch (e) {
    console.error('Error fetching cursor:', e);
    return null;
  }
}

export async function saveUpdateCursor(cursor: IndexerEventIDView | null) {
  try {
    const cursorStr = serializeCursor(cursor);
    const { error } = await supabase
      .from(CAP_SYNC_TABLE_NAME)
      .upsert(
        {
          event_type: `${PACKAGE_ID}::acp_registry::UpdateEvent`,
          cursor: cursorStr,
          last_updated: new Date()
        },
        { onConflict: 'event_type' }
      );

    if (error) throw error;
    console.log(`Update Cursor saved: ${cursorStr}`);
  } catch (e) {
    console.error('Error saving cursor:', e);
  }
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export async function storeToSupabase(
  data: any,
  cid: string,
  car_uri: string,
  version: number,
): Promise<void> {
  const { data: existingData, error: queryError } = await supabase
    .from(CAP_TABLE_NAME)
    .select("version")
    .eq("car_uri", car_uri)
    .maybeSingle();

  if (queryError) {
    throw new Error(`Supabase query failed: ${queryError.message}`);
  }

  if (existingData && version <= existingData.version) {
    console.log(
      `Skipping update for ${car_uri}. ` +
        `Current version ${existingData.version} >= provided version ${version}`
    );
    return;
  }

  const { error } = await supabase.from(CAP_TABLE_NAME).upsert(
    {
      car_uri: car_uri,
      name: data.idName,
      id: data.id,
      cid: cid,
      display_name: data.metadata.displayName,
      description: data.metadata.description,
      submitted_at: data.metadata.submittedAt,
      homepage: data.metadata.homepage,
      repository: data.metadata.repository,
      thumbnail: data.metadata.thumbnail,
      tags: data.metadata.tags,
      version: version,
      timestamp: new Date().toISOString(),
    },
    { onConflict: "car_uri" }
  );

  if (error) {
    throw new Error(`Supabase operation failed: ${error.message}`);
  }
}

export async function queryFromSupabase(
  name?: string | null,
  cid?: string | null,
  tags?: string[] | null,
  page: number = 0,
  pageSize: number = 50
): Promise<{
  success: boolean;
  items?: Array<{ cid: string; name: string; id: string, version: number, display_name: string, tags: string[]}>;
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
      .from(CAP_TABLE_NAME)
      .select('cid, name, id, version, display_name, tags, description, submitted_at, homepage, repository, thumbnail', { count: 'exact' });

    // Add filtering conditions - only add if values are not null/empty
    if (name && name.trim()) {
      query = query.ilike('name', `%${name}%`);
    }
    if (cid && cid.trim()) {
      query = query.ilike('cid', `%${cid}%`);
    }
    
    // Add tags filtering using PostgreSQL JSONB operators
    // TODO TAGS
    if (tags && tags.length > 0) {
      const orConditions = tags
        .map(tag => `tags.cs.${JSON.stringify([tag])}`)
        .join(',');
      query = query.or(orConditions);
    }

    // Apply pagination
    query = query.range(offset, offset + validatedPageSize - 1);

    // Execute query
    const { data, count, error } = await query;

    if (error) throw error;

    // Handle empty results
    if (!data || data.length === 0) {
      return {
        success: true,
        items: [],
        page,
        pageSize: validatedPageSize,
        totalItems: 0,
        totalPages: 0
      };
    }

    // Calculate total pages
    const totalItems = count || data.length;
    const totalPages = Math.ceil(totalItems / validatedPageSize);

    return {
      success: true,
      items: data,
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

// Get all unique tags from the database
export async function getAllTags(): Promise<{
  success: boolean;
  tags?: string[];
  error?: string;
}> {
  try {
    const { data, error } = await supabase
      .from(CAP_TABLE_NAME)
      .select('tags');

    if (error) throw error;

    if (!data || data.length === 0) {
      return {
        success: true,
        tags: []
      };
    }

    // Extract and flatten all tags
    const allTags = new Set<string>();
    data.forEach(item => {
      if (item.tags && Array.isArray(item.tags)) {
        item.tags.forEach((tag: string) => allTags.add(tag));
      }
    });

    return {
      success: true,
      tags: Array.from(allTags).sort()
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get tags'
    };
  }
}

// Query by exact tag match (all provided tags must be present)
export async function queryByExactTags(
  tags: string[],
  page: number = 0,
  pageSize: number = 50
): Promise<{
  success: boolean;
  items?: Array<{ cid: string; name: string; id: string, version: number, display_name: string, tags: string[]}>;
  totalItems?: number;
  page?: number;
  pageSize?: number;
  totalPages?: number;
  error?: string;
}> {
  try {
    const validatedPageSize = Math.min(pageSize, 50);
    const offset = page * validatedPageSize;

    // Use contains operator (@>) to check if tags array contains all specified tags
    const { data, count, error } = await supabase
      .from(CAP_TABLE_NAME)
      .select('cid, name, id, version, display_name, tags', { count: 'exact' })
      .contains('tags', tags)
      .range(offset, offset + validatedPageSize - 1);

    if (error) throw error;

    if (!data || data.length === 0) {
      return {
        success: true,
        items: [],
        page,
        pageSize: validatedPageSize,
        totalItems: 0,
        totalPages: 0
      };
    }

    const totalItems = count || data.length;
    const totalPages = Math.ceil(totalItems / validatedPageSize);

    return {
      success: true,
      items: data.map(item => ({
        cid: item.cid,
        name: item.name,
        id: item.id,
        version: item.version,
        display_name: item.display_name,
        tags: item.tags || []
      })),
      totalItems,
      page,
      pageSize: validatedPageSize,
      totalPages
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to query by exact tags'
    };
  }
}