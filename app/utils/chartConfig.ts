import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  defaults
} from 'chart.js';

// Регистрируем необходимые компоненты
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Устанавливаем глобальные настройки для всех графиков
defaults.font.family = 'Inter, system-ui, sans-serif';
defaults.color = 'rgba(255, 255, 255, 0.7)';
defaults.borderColor = 'rgba(255, 255, 255, 0.1)';
defaults.plugins.tooltip.backgroundColor = 'rgba(17, 24, 39, 0.8)';
defaults.plugins.tooltip.padding = 12;
defaults.plugins.tooltip.titleFont = { size: 14, weight: 'bold' };
defaults.plugins.tooltip.bodyFont = { size: 12 };
defaults.plugins.tooltip.bodySpacing = 4;
defaults.plugins.tooltip.cornerRadius = 4;
defaults.plugins.legend.labels.padding = 16; 