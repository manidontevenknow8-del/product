# PetClues Vet Bill Decoder Report

**Date:** May 31, 2026  
**Scope:** First AI feature — extract structured care data from uploaded vet documents  
**Build status:** `npm run build` passes (607 modules)

**Constraints honored:** Extraction only via AI (no chat UI). User must approve before anything saves.

---

## Executive Summary

**Vet Bill Decoder** reads uploaded PDFs and images from the pet document vault, uses OpenRouter (one API key, multiple models) to extract structured care data, presents results for user review, and only after approval creates health records and reminders. Every extraction is stored in `vet_bill_extractions` for history and audit.

---

## Phase 1 — Extraction pipeline

### Architecture

```
Upload (Scan page)
  → pet_documents + storage
  → decode-vet-document edge function
  → OpenRouter (OpenAI-compatible API)
  → vet_bill_extractions (pending_review)
  → Review UI
```

### Edge function

| File | Purpose |
|------|---------|
| `supabase/functions/decode-vet-document/index.ts` | Auth, download document, run AI, persist extraction |
| `supabase/functions/_shared/vetBillDecoder/extract.ts` | OpenRouter client (images + PDF) |
| `supabase/functions/_shared/vetBillDecoder/schema.ts` | JSON schema + prompt + ID assignment |

### AI provider — OpenRouter (single API key)

All extraction runs through [OpenRouter](https://openrouter.ai/) using the OpenAI-compatible API. One key routes to any supported model.

| Input | Default model (OpenRouter slug) | Env override |
|-------|----------------------------------|--------------|
| JPG / PNG | `openai/gpt-4o-mini` | `VET_DECODER_OPENROUTER_MODEL` |
| PDF | `google/gemini-2.5-flash` | `VET_DECODER_OPENROUTER_PDF_MODEL` |

**Required secret:** `OPENROUTER_API_KEY`

You can swap models without code changes — e.g. `anthropic/claude-3.5-haiku`, `google/gemini-2.0-flash-001`, etc. See [openrouter.ai/models](https://openrouter.ai/models).

### Extraction output categories

| Category | Maps to |
|----------|---------|
| Potential vaccinations | `vaccination` health records |
| Potential medications | `medication` health records |
| Potential diagnoses | `diagnosis` health records |
| Potential follow-up dates | `wellness` health records |
| Potential reminder dates | Direct reminders |

Each item includes `confidence` (`high` / `medium` / `low`).

### Client service

| File | Purpose |
|------|---------|
| `src/services/vetBillDecoder/vetBillDecoderService.ts` | Invoke edge function, history, apply approved |
| `src/services/vetBillDecoder/vetBillDecoderTypes.ts` | Shared types |
| `src/services/vetBillDecoder/mockVetBillDecoder.ts` | Local dev without AI |

---

## Phase 2 — User review (nothing auto-saves)

### UI

| Component | Purpose |
|-----------|---------|
| `VetBillDecoderReview.tsx` | Checkbox review for all five categories |
| `ScanPage.tsx` | Auto-decode after upload; re-decode from recent scans |

Review rules:

- All items default to **unchecked** (`approved: false`)
- Banner: *"Nothing is saved until you approve selected items"*
- **Dismiss** → status `rejected`, no records created
- **Save N approved items** → Phase 3 apply

---

## Phase 3 — Approved items → records + reminders

**File:** `applyApprovedExtraction()` in `vetBillDecoderService.ts`

| Approved item | Creates |
|---------------|---------|
| Vaccination | Health record `vaccination` + linked `sourceDocumentId` |
| Medication | Health record `medication` (`endDate` → `nextDueDate`) |
| Diagnosis | Health record `diagnosis` |
| Follow-up date | Health record `wellness` with `nextDueDate` |
| Reminder date | Reminder via `reminderService.create()` |

Health record creation triggers the **Automation Engine** (reminders from due dates when applicable).

Review status after save:

- `approved` — all items checked  
- `partially_approved` — some checked  
- `rejected` — dismiss or none checked  

---

## Phase 4 — Extraction history

### Database

**Migration:** `supabase/migrations/20250531800000_create_vet_bill_extractions.sql`

| Column | Purpose |
|--------|---------|
| `extraction_result` | Full AI JSON + approval flags |
| `approved_snapshot` | What user approved at review time |
| `model_used` | e.g. `openai/gpt-4o-mini`, `google/gemini-2.5-flash` |
| `status` | `pending_review` / `approved` / `partially_approved` / `rejected` |
| `reviewed_at` | When user completed review |

### UI

`VetBillDecoderHistory.tsx` on Scan page — last 8 extractions per pet with status and model.

---

## Deployment

1. Run migration: `20250531800000_create_vet_bill_extractions.sql`
2. Set edge function secrets:
   ```bash
   supabase secrets set OPENROUTER_API_KEY=sk-or-v1-...
   # Optional model overrides:
   supabase secrets set VET_DECODER_OPENROUTER_MODEL=openai/gpt-4o-mini
   supabase secrets set VET_DECODER_OPENROUTER_PDF_MODEL=google/gemini-2.5-flash
   ```
3. Deploy function:
   ```bash
   npx supabase functions deploy decode-vet-document
   ```

---

## User flow

1. Scan page → upload PDF or image  
2. Document saved to vault  
3. AI decodes → review card appears  
4. User checks items to keep → **Save approved items**  
5. Health records + reminders created; automation may add linked reminders  
6. Extraction appears in **Decoder history**  

---

## Verification checklist

- [ ] Upload JPG vet bill → review card with extracted items  
- [ ] Upload PDF → Gemini via OpenRouter (`google/gemini-2.5-flash` default)  
- [ ] Unchecked items are not saved  
- [ ] Approved vaccination creates health record linked to document  
- [ ] Approved reminder date creates reminder  
- [ ] Dismiss marks extraction `rejected`  
- [ ] History shows past extractions  
- [x] `npm run build` passes  

---

## Files touched

| File | Change |
|------|--------|
| `supabase/migrations/20250531800000_create_vet_bill_extractions.sql` | **New** |
| `supabase/functions/decode-vet-document/index.ts` | **New** |
| `supabase/functions/_shared/vetBillDecoder/*` | **New** |
| `src/services/vetBillDecoder/*` | **New** |
| `src/components/scan/VetBillDecoderReview.tsx` | **New** |
| `src/components/scan/VetBillDecoderHistory.tsx` | **New** |
| `src/pages/ScanPage.tsx` | Decode + review flow |
| `src/components/scan/ScanHero.tsx` | AI copy |
| `supabase/config.toml` | `decode-vet-document` JWT |
| `src/types/analytics.ts` | `vet_bill_decoded`, `vet_bill_approved` |

---

## Out of scope

| Item | Notes |
|------|-------|
| Chat interface | Extraction only |
| Auto-save | Explicit user approval required |
| OCR without AI | Not implemented |
| Multi-page PDF editing | Single-pass extraction |
