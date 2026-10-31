/**
 * Timeline logic — deterministic dependency recalculation.
 *
 * When a task is marked delayed or the event date changes, this module
 * recalculates downstream deadlines and flags tasks at risk.
 */

import type { TimelineTask } from '@/types';

/**
 * Given a number of days before the event, compute the actual date.
 */
export function daysBeforeEvent(eventDate: string, daysBefore: number): string {
  const d = new Date(eventDate);
  d.setDate(d.getDate() - daysBefore);
  return d.toISOString().split('T')[0];
}

/**
 * Recalculate downstream deadlines when a task is delayed.
 *
 * If a task is delayed, all tasks that depend on it (directly or transitively)
 * are shifted forward by the same number of days the parent was delayed.
 * A task is flagged "atRisk" if its new deadline is after the event date
 * or within 3 days of the event.
 *
 * @param tasks - Current task list.
 * @param delayedTaskId - ID of the task that was delayed.
 * @param newDeadline - The new (later) deadline for the delayed task.
 * @param eventDate - The event date (ISO string).
 * @returns Updated tasks with recalculated deadlines and atRisk flags.
 */
export function recalcAfterDelay(
  tasks: TimelineTask[],
  delayedTaskId: string,
  newDeadline: string,
  eventDate: string
): TimelineTask[] {
  const taskMap = new Map(tasks.map((t) => [t.id, { ...t }]));
  const delayed = taskMap.get(delayedTaskId);
  if (!delayed) return tasks;

  const oldDeadline = new Date(delayed.deadline);
  const updatedDeadline = new Date(newDeadline);
  const delayDays = Math.ceil(
    (updatedDeadline.getTime() - oldDeadline.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (delayDays <= 0) return tasks;

  // Update the delayed task itself
  delayed.deadline = newDeadline;
  delayed.delayed = true;

  // BFS to find all downstream dependents
  const visited = new Set<string>([delayedTaskId]);
  const queue = [delayedTaskId];

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    for (const [, task] of taskMap) {
      if (!visited.has(task.id) && task.dependsOn.includes(currentId)) {
        const d = new Date(task.deadline);
        d.setDate(d.getDate() + delayDays);
        task.deadline = d.toISOString().split('T')[0];
        visited.add(task.id);
        queue.push(task.id);
      }
    }
  }

  // Flag at-risk tasks
  const eventD = new Date(eventDate);
  const riskThresholdMs = 3 * 24 * 60 * 60 * 1000;

  for (const [, task] of taskMap) {
    const deadlineD = new Date(task.deadline);
    task.atRisk =
      deadlineD > eventD ||
      (eventD.getTime() - deadlineD.getTime() < riskThresholdMs && !task.completed);
  }

  return Array.from(taskMap.values());
}

/**
 * Recalculate all deadlines when the event date changes.
 *
 * Maintains relative spacing: each task's "days before event" ratio
 * is preserved against the new date.
 *
 * @param tasks - Current task list.
 * @param oldEventDate - Original event date.
 * @param newEventDate - New event date.
 * @returns Updated tasks.
 */
export function recalcForNewEventDate(
  tasks: TimelineTask[],
  oldEventDate: string,
  newEventDate: string
): TimelineTask[] {
  const oldD = new Date(oldEventDate).getTime();
  const newD = new Date(newEventDate).getTime();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return tasks.map((task) => {
    const taskD = new Date(task.deadline).getTime();
    const daysBefore = Math.round((oldD - taskD) / (1000 * 60 * 60 * 24));
    const newDeadline = new Date(newD);
    newDeadline.setDate(newDeadline.getDate() - daysBefore);

    // Don't set deadlines in the past
    const finalDeadline = newDeadline < today ? today : newDeadline;

    const atRisk =
      finalDeadline >= new Date(newEventDate) ||
      (new Date(newEventDate).getTime() - finalDeadline.getTime() <
        3 * 24 * 60 * 60 * 1000 &&
        !task.completed);

    return {
      ...task,
      deadline: finalDeadline.toISOString().split('T')[0],
      atRisk,
    };
  });
}

/**
 * Get the next N incomplete, non-delayed tasks sorted by deadline.
 */
export function getNextTasks(tasks: TimelineTask[], count: number = 3): TimelineTask[] {
  return tasks
    .filter((t) => !t.completed)
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, count);
}
