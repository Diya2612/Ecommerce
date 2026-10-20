import { Layers } from 'lucide-react';

export function TierEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-8">
      <div className="size-16 rounded-full bg-purple-100 flex items-center justify-center mb-4">
        <Layers className="size-8 text-purple-400" />
      </div>
      <h3 className="font-semibold text-slate-900 mb-2">Select a Tier</h3>
      <p className="text-sm text-slate-600 max-w-md">
        Choose a tier from the hierarchy tree to view its details, or click "Add Tier" to create a new one.
      </p>
    </div>
  );
}