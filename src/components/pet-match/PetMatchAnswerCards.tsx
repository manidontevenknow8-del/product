type AnswerOption = {
  value: string;
  label: string;
  hint?: string;
};

type PetMatchAnswerCardsProps = {
  options: AnswerOption[];
  selected?: string;
  onSelect: (value: string) => void;
};

export function PetMatchAnswerCards({ options, selected, onSelect }: PetMatchAnswerCardsProps) {
  return (
    <div className="mt-10 grid gap-4 sm:mt-12 sm:grid-cols-2 sm:gap-5">
      {options.map((option) => {
        const isSelected = selected === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onSelect(option.value)}
            className={`group border bg-white/40 px-6 py-6 text-left transition-all sm:px-8 sm:py-8 ${
              isSelected
                ? 'border-stone-800 shadow-[0_8px_30px_rgba(28,25,23,0.06)]'
                : 'border-stone-200/80 hover:border-stone-800'
            }`}
          >
            <span className="block font-serif text-xl text-stone-900 sm:text-2xl">
              {option.label}
            </span>
            {option.hint && (
              <span className="mt-2 block font-sans text-sm leading-relaxed text-stone-500">
                {option.hint}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
