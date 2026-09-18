import React from 'react';
import { Icons } from '../../core/icons';

export interface DynamicArrayFieldProps {
  label: string;
  items: any[];
  itemLabel?: string;
  itemDefaultValue?: any;
  onChange: (updated: any[]) => void;
}

export const DynamicArrayField: React.FC<DynamicArrayFieldProps> = ({
  label,
  items = [],
  itemLabel = 'Item',
  itemDefaultValue = 'Novo item',
  onChange,
}) => {
  const handleAddItem = () => {
    onChange([...items, itemDefaultValue]);
  };

  const handleRemoveItem = (index: number) => {
    const next = items.filter((_, i) => i !== index);
    onChange(next);
  };

  const handleUpdateItem = (index: number, val: any) => {
    const next = [...items];
    next[index] = val;
    onChange(next);
  };

  return (
    <div className="space-y-3 bg-slate-950/60 border border-slate-800 rounded-2xl p-4">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Icons.Layers />
          <span>{label}</span>
          <span className="text-slate-500 font-mono text-[10px]">({items.length})</span>
        </label>
        <button
          type="button"
          onClick={handleAddItem}
          className="px-2.5 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white text-xs font-semibold flex items-center gap-1 transition"
        >
          <Icons.Plus />
          <span>Adicionar {itemLabel}</span>
        </button>
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
        {items.map((it, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-slate-500 w-4 text-center">
              {idx + 1}
            </span>
            <input
              type="text"
              value={it}
              onChange={(e) => handleUpdateItem(idx, e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <button
              type="button"
              onClick={() => handleRemoveItem(idx)}
              className="p-1 text-slate-500 hover:text-rose-400 transition"
              title="Remover este item"
            >
              <Icons.Trash />
            </button>
          </div>
        ))}

        {items.length === 0 && (
          <div className="text-center py-4 text-xs text-slate-500 italic">
            Nenhum item adicionado. Clique no botão acima para incluir.
          </div>
        )}
      </div>
    </div>
  );
};

export default DynamicArrayField;
