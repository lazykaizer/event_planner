'use client';

import React, { useState } from 'react';
import type { Timeline, TimelineTask, BudgetPlan, UserIntake, Language } from '@/types';
import { formatDate, daysUntil } from '@/lib/formatters';
import { recalcAfterDelay, getNextTasks } from '@/lib/timeline';
import { AlertBanner } from '@/components/AlertBanner';

interface TimelineViewProps {
  timeline: Timeline | null;
  intake: UserIntake;
  budgetPlan: BudgetPlan;
  language: Language;
  onUpdateTimeline: (timeline: Timeline) => void;
}

export function TimelineView({
  timeline,
  intake,
  budgetPlan,
  language,
  onUpdateTimeline,
}: TimelineViewProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [delayingTaskId, setDelayingTaskId] = useState<string | null>(null);
  const [newDeadlineInput, setNewDeadlineInput] = useState<string>('');

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/timeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intake,
          budgetPlan,
          language,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate timeline');
      }

      onUpdateTimeline(data.timeline);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown timeline error');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleComplete = (taskId: string) => {
    if (!timeline) return;
    const updatedTasks = timeline.tasks.map((t) =>
      t.id === taskId ? { ...t, completed: !t.completed, atRisk: false } : t
    );
    onUpdateTimeline({ ...timeline, tasks: updatedTasks });
  };

  const startDelay = (task: TimelineTask) => {
    setDelayingTaskId(task.id);
    setNewDeadlineInput(task.deadline);
  };

  const applyDelay = (taskId: string) => {
    if (!timeline || !newDeadlineInput) return;
    const recalculated = recalcAfterDelay(
      timeline.tasks,
      taskId,
      newDeadlineInput,
      intake.eventDate
    );
    onUpdateTimeline({ ...timeline, tasks: recalculated });
    setDelayingTaskId(null);
  };

  const next3 = timeline ? getNextTasks(timeline.tasks, 3) : [];

  return (
    <div className="space-y-6">
      {/* Intro Card */}
      <div className="card bg-gradient-to-r from-cream-100 to-white border-maroon-100 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="max-w-xl space-y-1.5">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-maroon-100 text-maroon-900 border border-maroon-200">
            <span>📅</span>
            <span>{language === 'hi' ? 'निर्भरता-आधारित समय सारिणी' : 'Dependency-Aware Timeline'}</span>
          </span>
          <h2 className="text-xl sm:text-2xl font-heading font-bold text-maroon-900">
            {language === 'hi'
              ? 'विवाह समारोह की समयबद्ध कार्यसूची'
              : 'Master Event Milestone Timeline'}
          </h2>
          <p className="text-xs sm:text-sm text-gray-600">
            {language === 'hi'
              ? `समारोह की तारीख: ${formatDate(intake.eventDate)} (${daysUntil(intake.eventDate)} दिन शेष)`
              : `Event Date: ${formatDate(intake.eventDate)} (${daysUntil(intake.eventDate)} days remaining)`}
          </p>
        </div>

        {!timeline && (
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isLoading}
            className="btn-primary shrink-0 py-3 px-6 text-sm"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>{language === 'hi' ? 'समय सारिणी बन रही है...' : 'Generating Timeline...'}</span>
              </span>
            ) : (
              <span>{language === 'hi' ? '✨ समय सारिणी तैयार करें' : '✨ Generate Master Timeline'}</span>
            )}
          </button>
        )}
      </div>

      {error && (
        <AlertBanner
          type="error"
          title={language === 'hi' ? 'समय सारिणी निर्माण त्रुटि' : 'Timeline Generation Error'}
          message={error}
          onRetry={handleGenerate}
        />
      )}

      {timeline && (
        <div className="space-y-6 animate-slide-up">
          {/* Top Hero Banner: "Next 3 Things to Do" */}
          {next3.length > 0 && (
            <div className="card bg-saffron-50/70 border-2 border-saffron-300 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-bold text-base text-saffron-950 flex items-center gap-2">
                  <span>⚡</span>
                  <span>{language === 'hi' ? 'अगले 3 सबसे जरूरी काम (Next 3 Things to Do):' : 'Next 3 Priority Milestones:'}</span>
                </h3>
                <span className="text-xs font-semibold text-saffron-800">Immediate Focus</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {next3.map((task, idx) => (
                  <div
                    key={task.id}
                    className="p-3.5 rounded-xl bg-white border border-saffron-200 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-semibold text-saffron-800 mb-1">
                        <span>#0{idx + 1}</span>
                        <span>{formatDate(task.deadline)}</span>
                      </div>
                      <h4 className="font-semibold text-sm text-gray-900 mb-1">{task.title}</h4>
                      <p className="text-xs text-gray-600 line-clamp-2">{task.description}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleComplete(task.id)}
                      className="mt-3 text-xs font-medium text-maroon-900 hover:text-maroon-700 underline text-left"
                    >
                      ✓ {language === 'hi' ? 'पूर्ण चिन्हित करें' : 'Mark as Done'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Master Timeline List */}
          <div className="card space-y-4">
            <div className="flex items-center justify-between border-b border-cream-200 pb-3">
              <h3 className="font-heading font-semibold text-base text-gray-900">
                {language === 'hi' ? 'संपूर्ण कार्यसूची (Master Milestone Checklist)' : 'Complete Event Milestones'}
              </h3>
              <span className="text-xs text-gray-500">
                {timeline.tasks.filter((t) => t.completed).length} / {timeline.tasks.length}{' '}
                {language === 'hi' ? 'पूर्ण' : 'completed'}
              </span>
            </div>

            <div className="space-y-3">
              {timeline.tasks.map((task) => {
                const isDelaying = delayingTaskId === task.id;

                return (
                  <div
                    key={task.id}
                    className={`p-4 rounded-xl border transition-all ${
                      task.completed
                        ? 'bg-cream-100/50 border-cream-200 opacity-60'
                        : task.atRisk
                        ? 'bg-red-50 border-red-300'
                        : task.delayed
                        ? 'bg-amber-50 border-amber-300'
                        : 'bg-white border-cream-200 hover:border-maroon-300'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        {/* Checkbox */}
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => toggleComplete(task.id)}
                          className="mt-1 h-4 w-4 rounded border-gray-300 text-maroon-900 focus:ring-maroon-500 cursor-pointer shrink-0"
                          aria-label={`Mark "${task.title}" as ${task.completed ? 'incomplete' : 'complete'}`}
                        />

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4
                              className={`font-semibold text-sm text-gray-900 ${
                                task.completed ? 'line-through text-gray-400' : ''
                              }`}
                            >
                              {task.title}
                            </h4>

                            {task.atRisk && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-900 border border-red-300 uppercase">
                                🚨 At Risk of Delay
                              </span>
                            )}

                            {task.delayed && !task.atRisk && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 uppercase">
                                ⏳ Rescheduled
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                            {task.description}
                          </p>

                          {task.dependsOn.length > 0 && (
                            <span className="text-[10px] text-gray-400 block mt-1">
                              Depends on: {task.dependsOn.join(', ')}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right Deadline & Actions */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0">
                        <span className="text-xs font-semibold text-gray-800">
                          {formatDate(task.deadline)}
                        </span>

                        {!task.completed && (
                          <div className="flex items-center gap-2">
                            {isDelaying ? (
                              <div className="flex items-center gap-1">
                                <input
                                  type="date"
                                  value={newDeadlineInput}
                                  onChange={(e) => setNewDeadlineInput(e.target.value)}
                                  className="px-2 py-1 text-xs border border-maroon-500 rounded"
                                />
                                <button
                                  type="button"
                                  onClick={() => applyDelay(task.id)}
                                  className="px-2 py-1 bg-maroon-900 text-white rounded text-xs"
                                >
                                  Apply
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDelayingTaskId(null)}
                                  className="text-xs text-gray-400"
                                >
                                  ✕
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => startDelay(task)}
                                className="text-xs text-amber-800 hover:text-amber-900 underline"
                              >
                                {language === 'hi' ? 'देरी दर्ज करें' : 'Report Delay'}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
