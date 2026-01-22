'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import clsx from 'clsx';

export interface PriceRangeSliderProps {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  step?: number;
  formatValue?: (value: number) => string;
  label?: string;
  className?: string;
}

// Двухсторонний слайдер для диапазона цен
export const PriceRangeSlider: React.FC<PriceRangeSliderProps> = ({
  min,
  max,
  value,
  onChange,
  step = 1,
  formatValue = (v) => `$${v}`,
  label,
  className,
}) => {
  const [localValue, setLocalValue] = useState(value);
  const trackRef = useRef<HTMLDivElement>(null);

  // Синхронизация с внешним value
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Процент позиции на треке
  const getPercent = useCallback(
    (val: number) => ((val - min) / (max - min)) * 100,
    [min, max]
  );

  // Обработчик изменения левого ползунка
  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMin = Math.min(Number(e.target.value), localValue[1] - step);
    const newValue: [number, number] = [newMin, localValue[1]];
    setLocalValue(newValue);
    onChange(newValue);
  };

  // Обработчик изменения правого ползунка
  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMax = Math.max(Number(e.target.value), localValue[0] + step);
    const newValue: [number, number] = [localValue[0], newMax];
    setLocalValue(newValue);
    onChange(newValue);
  };

  const minPercent = getPercent(localValue[0]);
  const maxPercent = getPercent(localValue[1]);

  return (
    <div className={clsx('space-y-3', className)}>
      {label && (
        <label className="block text-sm text-white/70">{label}</label>
      )}

      {/* Значения */}
      <div className="flex justify-between text-sm">
        <span className="text-cyan-400 font-medium">{formatValue(localValue[0])}</span>
        <span className="text-white/40">—</span>
        <span className="text-cyan-400 font-medium">{formatValue(localValue[1])}</span>
      </div>

      {/* Слайдер */}
      <div className="relative h-6" ref={trackRef}>
        {/* Фоновый трек */}
        <div className="absolute top-1/2 -translate-y-1/2 w-full h-1 bg-white/10 rounded-full" />

        {/* Активный трек */}
        <div
          className="absolute top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full"
          style={{
            left: `${minPercent}%`,
            width: `${maxPercent - minPercent}%`,
          }}
        />

        {/* Левый ползунок (min) */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localValue[0]}
          onChange={handleMinChange}
          className={clsx(
            'absolute w-full h-6 appearance-none bg-transparent cursor-pointer z-20',
            'pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto',
            '[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5',
            '[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white',
            '[&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-grab',
            '[&::-webkit-slider-thumb]:active:cursor-grabbing',
            '[&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-cyan-500'
          )}
        />

        {/* Правый ползунок (max) */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localValue[1]}
          onChange={handleMaxChange}
          className={clsx(
            'absolute w-full h-6 appearance-none bg-transparent cursor-pointer z-20',
            'pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto',
            '[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5',
            '[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white',
            '[&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-grab',
            '[&::-webkit-slider-thumb]:active:cursor-grabbing',
            '[&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-cyan-500'
          )}
        />
      </div>

      {/* Мин/Макс метки */}
      <div className="flex justify-between text-xs text-white/40">
        <span>{formatValue(min)}</span>
        <span>{formatValue(max)}</span>
      </div>
    </div>
  );
};

PriceRangeSlider.displayName = 'PriceRangeSlider';
