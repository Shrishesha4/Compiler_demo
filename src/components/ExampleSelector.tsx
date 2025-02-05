import { codeExamples } from './CodeExamples';

interface ExampleSelectorProps {
  onSelect: (code: string) => void;
}

export const ExampleSelector = ({ onSelect }: ExampleSelectorProps) => {
  return (
    <div className="relative inline-block">
      <select
        onChange={(e) => {
          const [category, index] = e.target.value.split('-');
          const example = codeExamples[category as keyof typeof codeExamples][Number(index)];
          if (example) {
            onSelect(example.code);
          }
        }}
        className="px-4 py-2 bg-neutral-700 text-white rounded-lg hover:bg-neutral-600 transition-colors cursor-pointer"
      >
        <option value="">Select Example</option>
        {Object.entries(codeExamples).map(([category, examples]) => (
          <optgroup key={category} label={category.charAt(0).toUpperCase() + category.slice(1)}>
            {examples.map((example, index) => (
              <option key={`${category}-${index}`} value={`${category}-${index}`}>
                {example.title}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </div>
  );
};