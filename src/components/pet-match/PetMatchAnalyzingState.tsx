export function PetMatchAnalyzingState() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-6 text-center">
      <div className="mb-8 flex gap-2" aria-hidden>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 animate-pulse rounded-full bg-stone-400"
            style={{ animationDelay: `${i * 200}ms` }}
          />
        ))}
      </div>
      <p className="font-sans text-[11px] uppercase tracking-[0.28em] text-stone-400">
        Pet Match Engine
      </p>
      <h2 className="mt-4 max-w-md font-serif text-3xl font-light text-stone-900 sm:text-4xl">
        Analyzing lifestyle compatibility…
      </h2>
      <p className="mt-4 max-w-sm font-sans text-sm leading-relaxed text-stone-500">
        Cross-referencing your sanctuary, rhythm, and care capacity with our breed library.
      </p>
    </div>
  );
}
