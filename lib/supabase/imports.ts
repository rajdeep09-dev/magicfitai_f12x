import { createClient } from './client';

export interface BulkImport {
  id: string;
  import_name: string;
  file_name: string | null;
  total_records: number;
  successful_records: number;
  failed_records: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error_log: string | null;
  imported_by: string;
  created_at: string;
  updated_at: string;
}

export async function createBulkImport(
  importName: string,
  fileName: string | null,
  totalRecords: number,
  userId: string
): Promise<BulkImport | null> {
  try {
    const supabase = supabase;
    const { data, error } = await supabase
      .from('bulk_imports')
      .insert([
        {
          import_name: importName,
          file_name: fileName,
          total_records: totalRecords,
          successful_records: 0,
          failed_records: 0,
          status: 'processing',
          imported_by: userId,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('[v0] Error creating bulk import record:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('[v0] Error in createBulkImport:', error);
    return null;
  }
}

export async function updateBulkImportStatus(
  importId: string,
  updates: {
    status: 'pending' | 'processing' | 'completed' | 'failed';
    successful_records?: number;
    failed_records?: number;
    error_log?: string;
  }
): Promise<BulkImport | null> {
  try {
    const supabase = supabase;
    const { data, error } = await supabase
      .from('bulk_imports')
      .update(updates)
      .eq('id', importId)
      .select()
      .single();

    if (error) {
      console.error('[v0] Error updating bulk import:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('[v0] Error in updateBulkImportStatus:', error);
    return null;
  }
}

export async function getBulkImports(): Promise<BulkImport[]> {
  try {
    const supabase = supabase;
    const { data, error } = await supabase
      .from('bulk_imports')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[v0] Error fetching bulk imports:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('[v0] Error in getBulkImports:', error);
    return [];
  }
}
