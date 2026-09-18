import React from 'react';
import { Icons } from '../../core/icons';
import { getShortLoremForField } from '../../core/lorem';

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

  const handleAddLoremItem = () => {
    onChange([...items, getShortLoremForField(label, 'item')]);
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
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Icons.Layers />
          <span>{label}</span>
          <span className="text-slate-500 font-mono text-[10px]">({items.length})</span>
        </label>
        <div className="flex items-center gap-1.5 ml-auto">
          <button
            type="button"
            onClick={handleAddLoremItem}
            className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/70 text-slate-300 hover:text-indigo-300 text-[11px] font-mono font-semibold transition"
            title="Adicionar item com texto de exemplo"
          >
            + Lorem
          </button>
          <button
            type="button"
            onClick={handleAddItem}
            className="px-2.5 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white text-xs font-semibold flex items-center gap-1 transition"
          >
            <Icons.Plus />
            <span>Adicionar {itemLabel}</span>
          </button>
        </div>
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
        {items.map((it, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-slate-500 w-4 text-center shrink-0">
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
              onClick={() => handleUpdateItem(idx, getShortLoremForField(label, 'item'))}
              className="px-1.5 py-1 rounded text-[10px] bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-indigo-300 font-mono transition shrink-0"
              title="Preencher item com Lorem Ipsum"
            >
              Lorem
            </button>
            <button
              type="button"
              onClick={() => handleRemoveItem(idx)}
              className="p-1 text-slate-500 hover:text-rose-400 transition shrink-0"
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
