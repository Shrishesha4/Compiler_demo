'use client';

interface ConsoleOutput {
  type: 'log' | 'error';
  content: string;
}

interface CodeOutputProps {
  output: ConsoleOutput[];
  error?: string;
}

export const CodeOutput = ({ output, error }: CodeOutputProps) => {
  return (
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
  );
};