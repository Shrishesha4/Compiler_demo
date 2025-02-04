'use client';

import MonacoEditor from '@monaco-editor/react';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export const CodeEditor = ({ value, onChange }: CodeEditorProps) => {
  return (
    <div className="rounded-lg overflow-hidden shadow-lg">
      <div className="bg-gray-800 text-white px-4 py-2 flex justify-between items-center">
        <h3 className="text-sm font-medium">Source Code</h3>
        <button
          className="px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 rounded-md transition-colors"
          onClick={() => onChange('')}
        >
          Clear
        </button>
      </div>
      <MonacoEditor
        height="400px"
        language="javascript"
        theme="vs-dark"
        value={value}
        onChange={(value) => onChange(value || '')}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          roundedSelection: false,
          scrollBeyondLastLine: false,
          automaticLayout: true,
        }}
      />
    </div>
  );
};