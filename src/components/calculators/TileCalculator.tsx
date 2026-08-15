import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Grid, Layers, Box, CheckCircle2 } from 'lucide-react';
import { formatINR } from '../../utils/formatters';

interface TileCalculatorProps {
  onResultChange?: (summary: string, params: Record<string, any>) => void;
}

interface TilePreset {
  id: string;
  name: string;
  widthInches: number;
  heightInches: number;
  tilesPerBox: number;
  description: string;
}

const TILE_PRESETS: TilePreset[] = [
  { id: '2x2', name: '2 × 2 ft (600 × 600 mm)', widthInches: 24, heightInches: 24, tilesPerBox: 4, description: 'Standard Living & Bedroom Vitrified' },
  { id: '4x2', name: '4 × 2 ft (1200 × 600 mm)', widthInches: 48, heightInches: 24, tilesPerBox: 2, description: 'Modern Large Format GVT/PGVT Slabs' },
  { id: '1x1', name: '1 × 1 ft (300 × 300 mm)', widthInches: 12, heightInches: 12, tilesPerBox: 9, description: 'Bathroom Anti-Skid Floor' },
  { id: '1.5x1', name: '1.5 × 1 ft (450 × 300 mm)', widthInches: 18, heightInches: 12, tilesPerBox: 6, description: 'Kitchen & Bathroom Wall Highlighter' },
  { id: '2.5x2.5', name: '2.6 × 2.6 ft (800 × 800 mm)', widthInches: 32, heightInches: 32, tilesPerBox: 3, description: 'Premium Luxury Floor Tiles' }
];

export const TileCalculator: React.FC<TileCalculatorProps> = ({ onResultChange }) => {
  const { currentToolParams } = useApp();

  const [roomLength, setRoomLength] = useState<number>(14);
  const [roomWidth, setRoomWidth] = useState<number>(12);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('2x2');
  const [wastagePercent, setWastagePercent] = useState<number>(8); // 8% recommended
  const [pricePerBox, setPricePerBox] = useState<number>(750); // ₹750 per box avg

  const preset = TILE_PRESETS.find(p => p.id === selectedPresetId) || TILE_PRESETS[0];

  // Room Area in Sq Ft
  const roomAreaSqFt = roomLength * roomWidth;

  // Single Tile Area in Sq Ft = (widthInches * heightInches) / 144
  const singleTileAreaSqFt = (preset.widthInches * preset.heightInches) / 144;
  const sqFtPerBox = singleTileAreaSqFt * preset.tilesPerBox;

  // Base tiles needed
  const baseTilesNeeded = Math.ceil(roomAreaSqFt / singleTileAreaSqFt);
  
  // Total Tiles with Wastage
  const totalTilesNeeded = Math.ceil(baseTilesNeeded * (1 + wastagePercent / 100));
  
  // Boxes needed
  const boxesNeeded = Math.ceil(totalTilesNeeded / preset.tilesPerBox);
  const totalPurchasedTiles = boxesNeeded * preset.tilesPerBox;
  const totalPurchasedSqFt = totalPurchasedTiles * singleTileAreaSqFt;

  const totalTileCost = boxesNeeded * pricePerBox;
  const estimatedLaborCost = Math.round(roomAreaSqFt * 18); // ₹18/sqft laying & adhesive
  const grandTotal = totalTileCost + estimatedLaborCost;

  useEffect(() => {
    if (onResultChange) {
      const summary = `${roomAreaSqFt} sq ft floor needs ${boxesNeeded} boxes (${totalTilesNeeded} tiles) of ${preset.name}`;
      onResultChange(summary, {
        roomAreaSqFt,
        boxesNeeded,
        totalTilesNeeded,
        preset: preset.name,
        totalTileCost,
        grandTotal
      });
    }
  }, [roomLength, roomWidth, selectedPresetId, wastagePercent, pricePerBox, boxesNeeded, totalTileCost, grandTotal]);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Input Column */}
        <div className="lg:col-span-7 bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-7 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-6">
          <h3 className="text-base font-bold text-neutral-900 dark:text-white font-display border-b border-neutral-100 dark:border-neutral-800 pb-3">
            Room Area & Dimensions (Feet)
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                Room Length (ft)
              </label>
              <input
                type="number"
                value={roomLength || ''}
                onChange={e => setRoomLength(Math.max(1, Number(e.target.value)))}
                className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 font-mono font-bold text-base text-neutral-900 dark:text-white outline-none focus:border-accent"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                Room Width (ft)
              </label>
              <input
                type="number"
                value={roomWidth || ''}
                onChange={e => setRoomWidth(Math.max(1, Number(e.target.value)))}
                className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 font-mono font-bold text-base text-neutral-900 dark:text-white outline-none focus:border-accent"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-semibold text-neutral-700 dark:text-neutral-300">
              Select Common Indian Tile Size
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {TILE_PRESETS.map(t => (
                <button
                  key={t.id}
                  onClick={() => setSelectedPresetId(t.id)}
                  className={`p-3 rounded-2xl text-left border transition-all ${
                    selectedPresetId === t.id
                      ? 'border-accent bg-accent/5 ring-2 ring-accent/20 text-neutral-900 dark:text-white'
                      : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/40 text-neutral-600 dark:text-neutral-400'
                  }`}
                >
                  <span className="font-bold text-xs block text-neutral-900 dark:text-white">{t.name}</span>
                  <span className="text-[10px] text-neutral-400 block">{t.description}</span>
                  <span className="text-[10px] font-mono text-accent block mt-1">
                    {t.tilesPerBox} tiles/box ({((t.widthInches * t.heightInches * t.tilesPerBox) / 144).toFixed(1)} sq ft)
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-neutral-100 dark:border-neutral-800">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Cutting Wastage Margin
              </label>
              <div className="flex gap-1.5">
                {[5, 8, 10, 15].map(w => (
                  <button
                    key={w}
                    onClick={() => setWastagePercent(w)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border ${
                      wastagePercent === w
                        ? 'bg-accent text-white border-accent'
                        : 'bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700'
                    }`}
                  >
                    {w}%
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Avg Rate per Box (₹)
              </label>
              <input
                type="number"
                value={pricePerBox || ''}
                onChange={e => setPricePerBox(Math.max(0, Number(e.target.value)))}
                className="w-full px-3.5 py-2 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 font-mono font-bold text-sm text-neutral-900 dark:text-white outline-none focus:border-accent"
              />
            </div>
          </div>
        </div>

        {/* Output Column */}
        <div className="lg:col-span-5 space-y-5">
          <div className="p-6 sm:p-7 rounded-3xl bg-neutral-900 text-white border border-neutral-800 shadow-xl relative overflow-hidden">
            <span className="text-xs font-bold uppercase tracking-wider text-accent block mb-1">
              Tile Boxes Required
            </span>
            <div className="text-4xl font-extrabold font-mono text-white mb-1">
              {boxesNeeded} <span className="text-xl font-normal text-neutral-400">Boxes</span>
            </div>
            <p className="text-xs text-neutral-400 mb-6">
              Total {totalPurchasedTiles} tiles ({totalPurchasedSqFt.toFixed(1)} Sq Ft) with {wastagePercent}% wastage
            </p>

            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-neutral-800 text-xs">
              <div className="p-3 rounded-2xl bg-neutral-800/60">
                <span className="text-neutral-400 block">Room Net Area</span>
                <span className="text-base font-bold font-mono text-white">{roomAreaSqFt} Sq Ft</span>
              </div>
              <div className="p-3 rounded-2xl bg-neutral-800/60">
                <span className="text-neutral-400 block">Single Tile Area</span>
                <span className="text-base font-bold font-mono text-neutral-200">{singleTileAreaSqFt.toFixed(2)} Sq Ft</span>
              </div>
            </div>

            {/* Estimated Total Budget */}
            <div className="mt-4 pt-4 border-t border-neutral-800 space-y-2 text-xs">
              <div className="flex justify-between text-neutral-300">
                <span>Tile Material Cost ({boxesNeeded} boxes):</span>
                <span className="font-mono font-semibold">{formatINR(totalTileCost)}</span>
              </div>
              <div className="flex justify-between text-neutral-300">
                <span>Estimated Laying & Adhesive (₹18/sqft):</span>
                <span className="font-mono font-semibold">{formatINR(estimatedLaborCost)}</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-emerald-400 pt-2 border-t border-neutral-800">
                <span>Total Estimated Project Cost:</span>
                <span className="font-mono">{formatINR(grandTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
