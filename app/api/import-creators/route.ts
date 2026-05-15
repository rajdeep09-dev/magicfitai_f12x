import { createClient } from '@/lib/supabase/server';
import { createBulkImport, updateBulkImportStatus } from '@/lib/supabase/imports';
import { NextRequest, NextResponse } from 'next/server';
import * as Papa from 'papaparse';

interface CreatorRow {
  creator_name: string;
  platform: string;
  deliverable: string;
  approval_status: string;
  progress_score: string;
  live_date: string;
  video_link: string;
  published_video_link: string;
  views: string;
  engagement_rate: string;
  followers: string;
  total_reach: string;
  spend: string;
  campaign_id?: string;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'editor' && profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Only editors can import' }, { status: 403 });
    }

    // Parse request
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const campaignId = (formData.get('campaignId') as string) || null;
    const importName = (formData.get('importName') as string) || `Import ${new Date().toISOString()}`;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Read CSV file
    const fileContent = await file.text();
    const parseResult = await new Promise<Papa.ParseResult<CreatorRow>>((resolve, reject) => {
      Papa.parse<CreatorRow>(fileContent, {
        header: true,
        skipEmptyLines: true,
        complete: resolve,
        error: reject,
      });
    });

    if (!parseResult.data || parseResult.data.length === 0) {
      return NextResponse.json({ error: 'CSV file is empty' }, { status: 400 });
    }

    // Create bulk import record
    const bulkImportRecord = await createBulkImport(importName, file.name, parseResult.data.length, user.id);

    if (!bulkImportRecord) {
      return NextResponse.json({ error: 'Failed to create import record' }, { status: 500 });
    }

    // Process creators in batches
    let successCount = 0;
    let failureCount = 0;
    const errors: string[] = [];

    const BATCH_SIZE = 100;
    for (let i = 0; i < parseResult.data.length; i += BATCH_SIZE) {
      const batch = parseResult.data.slice(i, i + BATCH_SIZE);
      const creators = batch
        .map((row, idx) => {
          try {
            // Validate required fields
            if (!row.creator_name?.trim()) {
              errors.push(`Row ${i + idx + 2}: Missing creator_name`);
              failureCount++;
              return null;
            }

            const platforms = ['Instagram', 'TikTok', 'YouTube'];
            if (!row.platform || !platforms.includes(row.platform)) {
              errors.push(`Row ${i + idx + 2}: Invalid platform. Must be one of: ${platforms.join(', ')}`);
              failureCount++;
              return null;
            }

            return {
              creator_name: row.creator_name.trim(),
              platform: row.platform as 'Instagram' | 'TikTok' | 'YouTube',
              deliverable: row.deliverable?.trim() || '',
              approval_status: row.approval_status?.trim() || 'Ideation',
              progress_score: Math.min(100, Math.max(0, parseInt(row.progress_score) || 0)),
              live_date: row.live_date?.trim() || null,
              video_link: row.video_link?.trim() || '',
              published_video_link: row.published_video_link?.trim() || null,
              views: Math.max(0, parseInt(row.views) || 0),
              engagement_rate: Math.max(0, parseFloat(row.engagement_rate) || 0),
              followers: Math.max(0, parseInt(row.followers) || 0),
              total_reach: Math.max(0, parseInt(row.total_reach) || 0),
              spend: Math.max(0, parseFloat(row.spend) || 0),
              campaign_id: campaignId || row.campaign_id || null,
            };
          } catch (error) {
            errors.push(`Row ${i + idx + 2}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            failureCount++;
            return null;
          }
        })
        .filter(Boolean);

      if (creators.length > 0) {
        const { error: insertError } = await supabase.from('creators').insert(creators as any);

        if (insertError) {
          console.error('[v0] Batch insert error:', insertError);
          failureCount += creators.length;
          errors.push(`Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${insertError.message}`);
        } else {
          successCount += creators.length;
        }
      }
    }

    // Update bulk import record with results
    const errorLog = errors.length > 0 ? errors.join('\n') : null;
    await updateBulkImportStatus(bulkImportRecord.id, {
      status: failureCount === 0 ? 'completed' : 'completed',
      successful_records: successCount,
      failed_records: failureCount,
      error_log: errorLog,
    });

    return NextResponse.json({
      success: true,
      importId: bulkImportRecord.id,
      totalRecords: parseResult.data.length,
      successCount,
      failureCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('[v0] Import error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Import failed' },
      { status: 500 }
    );
  }
}
