import { ArrowRight, FileText, Shield } from 'lucide-react';
import {
  GENESIS_VAULT_PRICE_DISPLAY,
  getGenesisVaultPaymentUrl,
} from '@/config/genesisVaultConfig';

export function GenesisOffer() {
  const paymentUrl = getGenesisVaultPaymentUrl();

  return (
    <div className="min-h-screen bg-[#FCFCFC] text-zinc-900 font-sans selection:bg-zinc-200 border-x border-zinc-200 max-w-[1400px] mx-auto">
      <nav className="w-full border-b border-zinc-200 px-6 py-4 flex justify-between items-center bg-white sticky top-0 z-50">
        <div className="text-[10px] uppercase tracking-[0.3em] font-medium text-zinc-900">
          P E T C L U E S
        </div>
        <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-medium">
          [ INVITATION ONLY ]
        </div>
      </nav>

      <main className="grid grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-7 p-8 md:p-16 lg:p-24 border-b lg:border-b-0 lg:border-r border-zinc-200 flex flex-col justify-center">
          <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 mb-8 font-mono">
            The Genesis Vault — Limited Allocation
          </div>

          <h1 className="text-[4rem] md:text-[5.5rem] font-serif leading-[0.9] tracking-tighter text-zinc-900 mb-8">
            True luxury is the absence of friction.
          </h1>

          <p className="text-lg md:text-xl font-serif text-zinc-600 leading-relaxed max-w-2xl mb-12">
            You provide the sanctuary; we handle the science. Secure your companion&apos;s
            biological legacy with a pristine, frictionless digital archive. For our founding
            members, we eliminate the data entry entirely.
          </p>

          <div className="space-y-6 mb-16 border-l border-zinc-200 pl-6">
            <div className="flex items-start gap-4">
              <FileText size={18} className="text-zinc-400 mt-1 shrink-0" strokeWidth={1.5} />
              <div>
                <h3 className="text-xs uppercase tracking-widest font-medium text-zinc-900 mb-1">
                  White-Glove Digitization
                </h3>
                <p className="text-sm font-serif text-zinc-500">
                  Hand us the messy PDFs. We manually build your pristine architecture.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Shield size={18} className="text-zinc-400 mt-1 shrink-0" strokeWidth={1.5} />
              <div>
                <h3 className="text-xs uppercase tracking-widest font-medium text-zinc-900 mb-1">
                  Lifetime Security
                </h3>
                <p className="text-sm font-serif text-zinc-500">
                  Zero recurring subscriptions. Your archive is secured forever.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center">
            {paymentUrl ? (
              <a
                href={paymentUrl}
                className="w-full sm:w-auto bg-zinc-900 text-white text-[10px] uppercase tracking-[0.2em] font-medium px-10 py-5 hover:bg-zinc-800 transition-colors flex items-center justify-center gap-3"
                rel="noopener noreferrer"
                target="_blank"
              >
                Secure Genesis Vault — {GENESIS_VAULT_PRICE_DISPLAY}{' '}
                <ArrowRight size={14} aria-hidden />
              </a>
            ) : (
              <span className="w-full sm:w-auto bg-zinc-300 text-zinc-600 text-[10px] uppercase tracking-[0.2em] font-medium px-10 py-5 flex items-center justify-center gap-3 cursor-not-allowed">
                Checkout unavailable — configure payment link
              </span>
            )}
            <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-mono">
              Only 14 allocations remaining
            </span>
          </div>
        </div>

        <div className="lg:col-span-5 bg-zinc-50 flex flex-col justify-between">
          <div className="p-8 md:p-16">
            <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 mb-8 font-mono">
              [ THE ARCHITECTURE ]
            </div>
            <div className="bg-white border border-zinc-200 p-8 shadow-sm">
              <div className="flex justify-between items-end border-b border-zinc-200 pb-6 mb-6">
                <div>
                  <div className="text-[9px] uppercase tracking-widest text-zinc-400 mb-2">
                    Vault Integrity
                  </div>
                  <div className="text-4xl font-serif">100%</div>
                </div>
                <div className="text-[9px] uppercase tracking-widest text-emerald-600 font-medium">
                  Secured
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between text-[10px] uppercase tracking-widest text-zinc-500">
                  <span>Vaccination Matrix</span>
                  <span className="text-zinc-900">Active</span>
                </div>
                <div className="flex justify-between text-[10px] uppercase tracking-widest text-zinc-500">
                  <span>Clinical Records</span>
                  <span className="text-zinc-900">Digitized</span>
                </div>
                <div className="flex justify-between text-[10px] uppercase tracking-widest text-zinc-500">
                  <span>Travel Passport</span>
                  <span className="text-zinc-900">Compliant</span>
                </div>
              </div>
            </div>
          </div>

          <img
            src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=800"
            alt="Companion resting peacefully"
            className="w-full h-64 md:h-96 object-cover grayscale contrast-125 border-t border-zinc-200"
            width={800}
            height={600}
            decoding="async"
          />
        </div>
      </main>
    </div>
  );
}
