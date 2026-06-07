import { createClient } from 'npm:@supabase/supabase-js@2.49.1';
import { extractVetDocument } from '../_shared/vetBillDecoder/extract.ts';
import { withItemIds } from '../_shared/vetBillDecoder/schema.ts';
import { requirePremiumTier } from '../_shared/subscription/requirePremium.ts';
import { enforceRateLimit, rateLimitKey } from '../_shared/security/rateLimit.ts';
import { requireUuid } from '../_shared/security/validation.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function userClient(authHeader: string) {
  const url = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  if (!url || !anonKey) throw new Error('Supabase env vars missing');
  return createClient(url, anonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false },
  });
}

function adminClient() {
  const url = Deno.env.get('SUPABASE_URL');
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !key) throw new Error('Supabase service role env vars missing');
  return createClient(url, key, { auth: { persistSession: false } });
}

async function fetchExistingExtraction(
  supabase: ReturnType<typeof userClient>,
  documentId: string,
  petId: string,
) {
  const { data, error } = await supabase
    .from('vet_bill_extractions')
    .select('*')
    .eq('document_id', documentId)
    .eq('pet_id', petId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { documentId: rawDocumentId, petId: rawPetId } = await req.json() as {
      documentId?: string;
      petId?: string;
    };

    let documentId: string;
    let petId: string;
    try {
      documentId = requireUuid(rawDocumentId, 'documentId');
      petId = requireUuid(rawPetId, 'petId');
    } catch {
      return new Response(JSON.stringify({ error: 'documentId and petId are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = userClient(authHeader);
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const admin = adminClient();
    const rateLimited = await enforceRateLimit(
      admin,
      rateLimitKey('decode_vet_document', userData.user.id),
      corsHeaders,
    );
    if (rateLimited) return rateLimited;

    const premiumBlock = await requirePremiumTier(supabase, userData.user.id);
    if (premiumBlock) return premiumBlock;

    const { data: document, error: docError } = await supabase
      .from('pet_documents')
      .select('id, pet_id, file_name, file_type, storage_path')
      .eq('id', documentId)
      .eq('pet_id', petId)
      .single();

    if (docError || !document) {
      return new Response(JSON.stringify({ error: 'Document not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const existing = await fetchExistingExtraction(supabase, documentId, petId);
    if (existing) {
      return new Response(JSON.stringify(mapRow(existing as Record<string, unknown>)), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: fileData, error: downloadError } = await admin.storage
      .from('pet-documents')
      .download(document.storage_path);

    if (downloadError || !fileData) {
      const hint = downloadError?.message?.includes('Bucket not found')
        ? 'Storage bucket "pet-documents" is missing. Run supabase db push to create it.'
        : downloadError?.message ?? 'Download failed';
      return new Response(JSON.stringify({ error: hint }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const bytes = new Uint8Array(await fileData.arrayBuffer());
    const { payload, model } = await extractVetDocument(bytes, document.file_type);
    const extractionResult = withItemIds(payload);

    const { data: record, error: insertError } = await admin
      .from('vet_bill_extractions')
      .insert({
        user_id: userData.user.id,
        pet_id: petId,
        document_id: documentId,
        status: 'saved',
        extraction_result: extractionResult,
        model_used: model,
      })
      .select('*')
      .single();

    if (insertError) {
      if (insertError.code === '23505' || insertError.message.toLowerCase().includes('duplicate')) {
        const raced = await fetchExistingExtraction(supabase, documentId, petId);
        if (raced) {
          return new Response(JSON.stringify(mapRow(raced as Record<string, unknown>)), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }
      const hint = insertError.message.includes('vet_bill_extractions')
        ? `${insertError.message}. Run: npx supabase db push`
        : insertError.message;
      return new Response(JSON.stringify({ error: hint }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(mapRow(record)), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function normalizeStatus(status: unknown): string {
  const s = String(status ?? 'saved');
  return s === 'pending_review' ? 'saved' : s;
}

function mapRow(row: Record<string, unknown>) {
  return {
    id: row.id,
    userId: row.user_id,
    petId: row.pet_id,
    documentId: row.document_id,
    status: normalizeStatus(row.status),
    extractionResult: row.extraction_result,
    approvedSnapshot: row.approved_snapshot ?? null,
    modelUsed: row.model_used ?? null,
    createdAt: row.created_at,
    reviewedAt: row.reviewed_at ?? null,
  };
}
