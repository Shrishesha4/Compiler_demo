'use client';

interface ConsoleOutput {
  type: 'log' | 'error';
  content: string;
}

interface CodeOutputProps {
  output: ConsoleOutput[];
  error?: string;
  onViewPhases?: () => void;
}

export const CodeOutput = ({ output, error, onViewPhases }: CodeOutputProps) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-end">
        <button
          onClick={onViewPhases}
          className="px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
        >
          View Phases
        </button>
      </div>
      <div className="bg-neutral-900 rounded-lg p-4 min-h-[100px] max-h-[200px] overflow-y-auto">
        {output.map((item, index) => (
          <div key={index} className={`mb-1 font-mono text-sm ${
            item.type === 'error' ? 'text-red-400' : 'text-green-400'
          }`}>
            {item.content}
          </div>
        ))}
        {error && (
          <div className="text-red-400 font-mono text-sm">{error}</div>
        )}
      </div>
    </div>
  );
};