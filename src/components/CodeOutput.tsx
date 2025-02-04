'use client';

interface CodeOutputProps {
  output: string[];
  error?: string;
}

export const CodeOutput = ({ output, error }: CodeOutputProps) => {
  return (
    <div className="rounded-lg overflow-hidden shadow-lg">
      <div className="bg-gray-800 text-white px-4 py-2 flex justify-between items-center">
        <h3 className="text-sm font-medium">Output</h3>
        <span className={`text-xs px-2 py-1 rounded ${error ? 'bg-red-500' : 'bg-green-500'}`}>
          {error ? 'Error' : 'Success'}
        </span>
      </div>
      <div className="bg-neutral-900 p-4 font-mono text-sm h-[200px] overflow-auto">
        {error ? (
          <div className="text-red-400">{error}</div>
        ) : (
          output.map((line, index) => (
            <div key={index} className="text-gray-300">
              {line}
            </div>
          ))
        )}
      </div>
    </div>
  );
};