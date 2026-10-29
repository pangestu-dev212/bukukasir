'use client';

import React, { useState } from 'react';
import { X, Copy, Check, MessageSquare } from 'lucide-react';
import { generateWhatsAppReport } from '@/lib/whatsapp';
import { TransactionItem } from '@/lib/types';

interface WhatsAppModalProps {
  isOpen: boolean;
  storeName: string;
  startDate: string;
  endDate: string;
  transactions: TransactionItem[];
  onClose: () => void;
}

export function WhatsAppShareModal({
  isOpen,
  storeName,
  startDate,
  endDate,
  transactions,
  onClose,
}: WhatsAppModalProps) {
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const reportText = generateWhatsAppReport(storeName, startDate, endDate, transactions);

  const handleCopy = () => {
    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(reportText)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header - Luxury Gradient */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-cyan-900 px-5 py-4 text-white flex items-center justify-between relative overflow-hidden shadow-md">
          <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/10 blur-2xl pointer-events-none" />

          <div className="flex items-center gap-2.5 relative z-10">
            <div className="w-8 h-8 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center text-teal-200">
              <MessageSquare className="w-4 h-4" />
            </div>
            <h2 className="font-extrabold text-base tracking-tight">Salin Rekap ke WhatsApp</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition relative z-10">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-3 overflow-y-auto flex-1">
          <p className="text-xs text-slate-600">
            Format laporan siap kirim ke grup keluarga, pasangan, atau catatan pribadi WhatsApp:
          </p>

          <pre className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl text-xs font-mono text-slate-800 whitespace-pre-wrap max-h-60 overflow-y-auto">
            {reportText}
          </pre>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={handleCopy}
              className="py-3 px-3 rounded-xl border-2 border-slate-300 hover:border-slate-400 font-bold text-xs text-slate-700 flex items-center justify-center gap-1.5 transition"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Tersalin!' : 'Salin Teks'}
            </button>

            <button
              onClick={handleOpenWhatsApp}
              className="py-3 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-bold text-xs text-white flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/30 transition"
            >
              <MessageSquare className="w-4 h-4" />
              Buka WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
