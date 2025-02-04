'use client';

interface CompilerPhasesProps {
  activePhase: string;
  onPhaseChange: (phase: string) => void;
}

export const CompilerPhases = ({ activePhase, onPhaseChange }: CompilerPhasesProps) => {
  const phases = [
    { id: 'lexical', name: 'Lexical Analysis', icon: '🔍' },
    { id: 'syntax', name: 'Syntax Analysis', icon: '🌳' },
    { id: 'semantic', name: 'Semantic Analysis', icon: '✨' },
    { id: 'intermediate', name: 'Intermediate Code', icon: '🔄' },
    { id: 'optimization', name: 'Optimization', icon: '⚡' },
    { id: 'codegen', name: 'Code Generation', icon: '💻' },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
      <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
        Compiler Phases
      </h3>
      <div className="space-y-2">
        {phases.map((phase) => (
          <button
            key={phase.id}
            onClick={() => onPhaseChange(phase.id)}
            className={`w-full text-left px-4 py-3 rounded-md transition-colors ${
              activePhase === phase.id
                ? 'bg-blue-500 text-white'
                : 'hover:bg-gray-900 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            <span className="mr-2">{phase.icon}</span>
            {phase.name}
          </button>
        ))}
      </div>
    </div>
  );
};