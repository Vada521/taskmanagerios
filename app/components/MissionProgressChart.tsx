'use client';

import { useState } from 'react';
import { Mission } from '../contexts/MissionContext';
import { format, differenceInDays, addDays } from 'date-fns';
import { ru } from 'date-fns/locale';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface MissionProgressChartProps {
  mission: Mission;
  onClose: () => void;
}

export default function MissionProgressChart({ mission, onClose }: MissionProgressChartProps) {
  const [tooltipData, setTooltipData] = useState<{
    x: number;
    y: number;
    date: Date;
    progress: number;
    expected: number;
  } | null>(null);

  const generateChartData = () => {
    if (!mission.startDate || !mission.endDate) return [];

    const days = differenceInDays(new Date(mission.endDate), new Date(mission.startDate));
    if (days <= 0) return [];

    const dailyTarget = mission.target / days;
    const currentDate = new Date();
    const data = [];

    for (let i = 0; i <= days; i++) {
      const date = addDays(new Date(mission.startDate), i);
      const expectedProgress = Math.min(dailyTarget * i, mission.target);
      
      const progressForDate = mission.progressHistory
        .filter(p => {
          const progressDate = new Date(p.date);
          return (
            progressDate.getFullYear() === date.getFullYear() &&
            progressDate.getMonth() === date.getMonth() &&
            progressDate.getDate() === date.getDate()
          );
        })
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]?.value;

      const lastKnownProgress = mission.progressHistory
        .filter(p => new Date(p.date) <= date)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]?.value ?? 0;

      data.push({
        date,
        expected: Math.round(expectedProgress),
        actual: date <= currentDate ? (progressForDate ?? lastKnownProgress) : null,
      });
    }

    return data;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">График прогресса миссии</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-900 rounded-lg p-4">
            <div className="h-64 relative">
              {generateChartData().map((point, index, array) => {
                if (!point.date || point.actual === null) return null;
                
                const x = (index / (array.length - 1)) * 100;
                const expectedY = ((mission.target - point.expected) / mission.target) * 100;
                const actualY = point.actual !== null 
                  ? ((mission.target - point.actual) / mission.target) * 100
                  : null;

                if (x === undefined || expectedY === undefined || actualY === null) return null;

                const nextPoint = array[index + 1];
                const nextActualY = nextPoint?.actual !== null 
                  ? ((mission.target - nextPoint.actual) / mission.target) * 100
                  : null;

                return (
                  <div key={index}>
                    {/* Линия ожидаемого прогресса */}
                    {index < array.length - 1 && (
                      <div
                        className="absolute h-px bg-gray-500"
                        style={{
                          left: `${x}%`,
                          top: `${expectedY}%`,
                          width: `${100 / (array.length - 1)}%`,
                          transform: `rotate(${Math.atan2(
                            ((mission.target - array[index + 1].expected) / mission.target) * 100 - expectedY,
                            100 / (array.length - 1)
                          )}rad)`,
                          transformOrigin: '0 50%'
                        }}
                      />
                    )}
                    
                    {/* Точка ожидаемого прогресса */}
                    <div
                      className="absolute w-2 h-2 bg-gray-500 rounded-full cursor-pointer"
                      style={{
                        left: `${x}%`,
                        top: `${expectedY}%`,
                        transform: 'translate(-50%, -50%)'
                      }}
                      onMouseEnter={() => setTooltipData({
                        x,
                        y: expectedY,
                        date: point.date,
                        progress: point.actual ?? 0,
                        expected: point.expected
                      })}
                      onMouseLeave={() => setTooltipData(null)}
                    />

                    {/* Точка реального прогресса */}
                    <div
                      className="absolute w-2 h-2 rounded-full cursor-pointer"
                      style={{
                        left: `${x}%`,
                        top: `${actualY}%`,
                        transform: 'translate(-50%, -50%)',
                        backgroundColor: mission.color
                      }}
                      onMouseEnter={() => setTooltipData({
                        x,
                        y: actualY,
                        date: point.date,
                        progress: point.actual ?? 0,
                        expected: point.expected
                      })}
                      onMouseLeave={() => setTooltipData(null)}
                    />

                    {/* Линия реального прогресса */}
                    {index < array.length - 1 && nextActualY !== null && (
                      <div
                        className="absolute h-px"
                        style={{
                          left: `${x}%`,
                          top: `${actualY}%`,
                          width: `${100 / (array.length - 1)}%`,
                          backgroundColor: mission.color,
                          transform: `rotate(${Math.atan2(
                            nextActualY - actualY,
                            100 / (array.length - 1)
                          )}rad)`,
                          transformOrigin: '0 50%'
                        }}
                      />
                    )}
                  </div>
                );
              })}

              {/* Tooltip */}
              {tooltipData && (
                <div 
                  className="absolute bg-gray-800 text-white px-3 py-2 rounded-lg shadow-lg text-sm z-10"
                  style={{
                    left: `${tooltipData.x}%`,
                    top: `${tooltipData.y}%`,
                    transform: 'translate(-50%, -150%)'
                  }}
                >
                  <div className="font-medium">
                    {format(tooltipData.date, 'd MMMM yyyy', { locale: ru })}
                  </div>
                  <div className="text-gray-400">
                    Прогресс: {tooltipData.progress} {mission.unit}
                  </div>
                  <div className="text-gray-400">
                    Ожидаемый: {Math.round(tooltipData.expected)} {mission.unit}
                  </div>
                </div>
              )}

              {/* Оси */}
              <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-600" />
              <div className="absolute left-0 bottom-0 right-0 h-px bg-gray-600" />
            </div>

            <div className="flex justify-between mt-4 text-sm text-gray-400">
              {mission.startDate && mission.endDate && (
                <>
                  <span>{format(new Date(mission.startDate), 'd MMM', { locale: ru })}</span>
                  <span>{format(new Date(mission.endDate), 'd MMM yyyy', { locale: ru })}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <div className="w-3 h-px bg-gray-500" />
              <span>Ожидаемый прогресс</span>
            </div>
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-px"
                style={{ backgroundColor: mission.color }}
              />
              <span>Текущий прогресс</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 