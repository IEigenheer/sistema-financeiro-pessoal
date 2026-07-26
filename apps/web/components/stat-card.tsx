'use client';

import { ReactNode, useState, FormEvent } from 'react';
import { Tooltip } from './tooltip';
import { formatCurrency } from '../lib/format';

type Props = {
  icon: string;
  label: string;
  value: number | string | null | undefined;
  formula?: string;
  color?: 'emerald' | 'amber' | 'sky' | 'rose' | 'violet';
  editable?: boolean;
  onSave?: (value: number) => void;
};

export function StatCard({ icon, label, value, formula, color = 'emerald', editable, onSave }: Props) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState('');

  const formattedValue = typeof value === 'string' ? value : formatCurrency(value);

  function startEditing() {
    if (!editable) return;
    setEditValue(String(Number(value ?? 0)));
    setEditing(true);
  }

  function handleSave() {
    setEditing(false);
    onSave?.(Number(editValue));
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') setEditing(false);
  }

  const card = (
    <article
      className={`stat-card ${editable ? 'stat-card-editable' : ''}`}
      onClick={editable && !editing ? startEditing : undefined}
    >
      <div className={`stat-card-icon stat-card-icon-${color}`}>
        {icon}
      </div>
      <div className="stat-card-content">
        <div className="stat-card-label">{label}</div>
        {editing ? (
          <input
            className="stat-card-input"
            type="number"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            autoFocus
          />
        ) : (
          <div className="stat-card-value">
            {formattedValue}
            {editable && <span className="stat-card-edit-icon">✏️</span>}
          </div>
        )}
        {formula && !editing && (
          <div className="stat-card-hint">{formula}</div>
        )}
      </div>
    </article>
  );

  if (formula) {
    return (
      <Tooltip content={formula}>
        {card}
      </Tooltip>
    );
  }

  return card;
}
