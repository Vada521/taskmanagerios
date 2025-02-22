/// <reference types="vitest" />
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MissionCard from '../MissionCard';
import { Mission } from '@/app/contexts/MissionContext';

describe('MissionCard', () => {
  const mockMission: Mission = {
    id: '1',
    title: 'Тестовая миссия',
    description: 'Описание тестовой миссии',
    folder: 'Основные',
    status: 'backlog',
    progress: 50,
    target: 100,
    unit: 'очков',
    color: '#4F46E5',
    startDate: new Date('2024-02-01'),
    endDate: new Date('2024-03-01'),
    isOnDashboard: false,
    progressHistory: [
      { date: new Date('2024-02-01'), progress: 0 },
      { date: new Date('2024-02-15'), progress: 50 }
    ],
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-15'),
    userId: 'user1'
  };

  const mockHandlers = {
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onToggleDashboard: vi.fn(),
    onProgressUpdate: vi.fn(),
    onArchive: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('отображает информацию о миссии', () => {
    render(<MissionCard mission={mockMission} {...mockHandlers} />);
    
    expect(screen.getByText('Тестовая миссия')).toBeInTheDocument();
    expect(screen.getByText('Описание тестовой миссии')).toBeInTheDocument();
    expect(screen.getByText('50 / 100 очков')).toBeInTheDocument();
  });

  it('вызывает onDelete при нажатии на кнопку удаления', async () => {
    render(<MissionCard mission={mockMission} {...mockHandlers} />);
    
    const deleteButton = screen.getByRole('button', { name: /удалить/i });
    await act(async () => {
      await fireEvent.click(deleteButton);
    });
    
    expect(mockHandlers.onDelete).toHaveBeenCalledWith(mockMission.id);
  });

  it('вызывает onProgressUpdate при изменении прогресса', async () => {
    render(<MissionCard mission={mockMission} {...mockHandlers} />);
    
    const progressText = screen.getByText('50 / 100 очков');
    await act(async () => {
      await fireEvent.click(progressText);
    });
    
    const input = screen.getByRole('spinbutton');
    await act(async () => {
      await fireEvent.change(input, { target: { value: '75' } });
      await fireEvent.blur(input);
    });
    
    expect(mockHandlers.onProgressUpdate).toHaveBeenCalledWith(mockMission.id, 75);
  });

  it('показывает кнопку архивации при достижении цели', () => {
    const completedMission = { ...mockMission, progress: 100 };
    render(<MissionCard mission={completedMission} {...mockHandlers} />);
    
    const archiveButton = screen.getByRole('button', { name: /завершить/i });
    expect(archiveButton).toBeInTheDocument();
  });

  it('вызывает onToggleDashboard при нажатии на кнопку звезды', async () => {
    render(<MissionCard mission={mockMission} {...mockHandlers} />);
    
    const starButton = screen.getByRole('button', { name: /добавить на дашборд/i });
    await act(async () => {
      await fireEvent.click(starButton);
    });
    
    expect(mockHandlers.onToggleDashboard).toHaveBeenCalledWith(mockMission.id);
  });

  it('показывает график прогресса при нажатии на кнопку графика', async () => {
    render(<MissionCard mission={mockMission} {...mockHandlers} />);
    
    const chartButton = screen.getByRole('button', { name: /показать график/i });
    await act(async () => {
      await fireEvent.click(chartButton);
    });
    
    expect(screen.getByRole('img', { name: /график прогресса/i })).toBeInTheDocument();
  });
}); 