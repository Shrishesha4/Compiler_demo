'use client';

import { useState } from 'react';
import { CodeEditor } from './CodeEditor';
import { CompilerPhases } from './CompilerPhases';
import { PhaseVisualizer } from './PhaseVisualizer';

export const CompilerDemo = () => {
  const [sourceCode, setSourceCode] = useState('');
  const [activePhase, setActivePhase] = useState('lexical');
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-6">
        <CodeEditor
          value={sourceCode}
          onChange={setSourceCode}
        />
        <CompilerPhases
          activePhase={activePhase}
          onPhaseChange={setActivePhase}
        />
      </div>
      <PhaseVisualizer
        sourceCode={sourceCode}
        phase={activePhase}
        onChange={setSourceCode}
      />
    </div>
  );
};