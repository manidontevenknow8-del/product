import { sendViaResend } from '../_shared/email/resendClient.ts';
import { subjectForEmail } from '../_shared/email/templates.ts';
import type { SendEmailInput } from '../_shared/email/types.ts';
import { isServiceRoleRequest } from '../_shared/security/auth.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (!isServiceRoleRequest(req)) {
    return new Response(
      JSON.stringify({ success: false, error: 'Server authorization required' }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }

  try {
    const body = (await req.json()) as SendEmailInput & { subject?: string };

    if (!body?.to || !body?.type || !body?.payload) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid request body' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const result = await sendViaResend({
      ...body,
      subject: body.subject || subjectForEmail(body),
    });

    return new Response(JSON.stringify(result), {
      status: result.success ? 200 : 502,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return new Response(JSON.stringify({ success: false, error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
