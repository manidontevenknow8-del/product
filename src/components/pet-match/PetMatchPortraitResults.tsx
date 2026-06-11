import type { EditorialBreedMatch } from '@/types/petMatchEditorial';

type PetMatchPortraitResultsProps = {
  matches: EditorialBreedMatch[];
};

export function PetMatchPortraitResults({ matches }: PetMatchPortraitResultsProps) {
  return (
    <div className="space-y-8 sm:space-y-10">
      <header className="text-center">
        <p className="font-sans text-[11px] uppercase tracking-[0.28em] text-stone-400">
          Your matches
        </p>
        <h2 className="mt-4 font-serif text-4xl font-light text-stone-900 sm:text-5xl">
          Three companions worth meeting
        </h2>
      </header>

      <div className="grid gap-8 lg:grid-cols-3">
        {matches.map((match, index) => (
          <article
            key={match.id}
            className="group overflow-hidden border border-stone-200/70 bg-white/50"
          >
            <div className="relative aspect-[3/4] overflow-hidden bg-stone-100">
              <img
                src={match.imageUrl}
                alt={match.breed}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                loading="lazy"
              />
              <div
                className="absolute inset-0 bg-gradient-to-t from-stone-950/75 via-stone-950/10 to-transparent"
                aria-hidden
              />
              <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
                <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-stone-300">
                  Match #{index + 1} · {match.matchScore}% fit
                </p>
                <h3 className="mt-1 font-serif text-2xl text-white sm:text-3xl">{match.breed}</h3>
              </div>
            </div>
            <div className="space-y-4 p-5 sm:p-6">
              <dl className="grid grid-cols-2 gap-4 border-b border-stone-100 pb-4">
                <div>
                  <dt className="font-sans text-[10px] uppercase tracking-[0.16em] text-stone-400">
                    Care difficulty
                  </dt>
                  <dd className="mt-1 font-sans text-sm text-stone-800">{match.careDifficulty}</dd>
                </div>
                <div>
                  <dt className="font-sans text-[10px] uppercase tracking-[0.16em] text-stone-400">
                    Est. monthly
                  </dt>
                  <dd className="mt-1 font-sans text-sm text-stone-800">
                    {match.monthlyCostLabel}
                  </dd>
                </div>
              </dl>
              <p className="font-sans text-sm leading-relaxed text-stone-600">{match.matchReason}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
