'use client';

import React from 'react';
import { PlusCircle, MinusCircle } from 'lucide-react';

interface ActionButtonsProps {
  onAddIncome: () => void;
  onAddExpense: () => void;
}

export function ActionButtons({ onAddIncome, onAddExpense }: ActionButtonsProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-20 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-4 py-3 shadow-[0_-8px_20px_rgba(0,0,0,0.06)]">
      <div className="max-w-2xl mx-auto grid grid-cols-2 gap-3">
        {/* Tombol Uang Masuk */}
        <button
          type="button"
          onClick={onAddIncome}
          className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white py-3 px-3 rounded-2xl font-extrabold text-base flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition cursor-pointer"
        >
          <PlusCircle className="w-5 h-5 stroke-[2.5]" />
          <span>+ Uang Masuk</span>
        </button>

        {/* Tombol Uang Keluar */}
        <button
          type="button"
          onClick={onAddExpense}
          className="w-full bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white py-3 px-3 rounded-2xl font-extrabold text-base flex items-center justify-center gap-2 shadow-md shadow-rose-600/20 transition cursor-pointer"
        >
          <MinusCircle className="w-5 h-5 stroke-[2.5]" />
          <span>- Uang Keluar</span>
        </button>
      </div>
    </div>
  );
}
