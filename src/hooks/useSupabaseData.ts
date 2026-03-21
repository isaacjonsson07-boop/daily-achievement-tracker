import { useState, useEffect, useRef, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import {
  NonNegotiable, NonNegotiableCompletion,
  DailyTask, JournalEntry,
  SavedReview, SystemReport,
} from '../types';
import { uid } from '../utils/dateUtils';

function newUUID(): string {
  return crypto.randomUUID();
}

interface UseSupabaseDataProps {
  user: User | null;
  authLoading: boolean;
}

export function useSupabaseData({ user, authLoading }: UseSupabaseDataProps) {
  const [nonNegotiables, setNonNegotiables] = useState<NonNegotiable[]>([]);
  const [nnCompletions, setNNCompletions] = useState<NonNegotiableCompletion[]>([]);
  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [systemDocuments, setSystemDocuments] = useState<Record<string, string>>({});
  const [savedReviews, setSavedReviews] = useState<SavedReview[]>([]);
  const [systemReports, setSystemReports] = useState<SystemReport[]>([]);
  const [readPatches, setReadPatches] = useState<string[]>([]);
  const [installationCompleteDate, setInstallationCompleteDate] = useState<string | null>(null);
  const [recalPending, setRecalPending] = useState<object | null>(null);
  const [loading, setLoading] = useState(true);

  const isFirstRender = useRef(true);
  const hasLoadedSupabase = useRef(false);

  // Refs for reading current state in callbacks without stale closures
  const nnCompletionsRef = useRef(nnCompletions);
  nnCompletionsRef.current = nnCompletions;
  const dailyTasksRef = useRef(dailyTasks);
  dailyTasksRef.current = dailyTasks;
  const journalEntriesRef = useRef(journalEntries);
  journalEntriesRef.current = journalEntries;

  // ── Load from localStorage on mount ──
  useEffect(() => {
    try {
      const nnRaw = localStorage.getItem('sa_non_negotiables');
      if (nnRaw) setNonNegotiables(JSON.parse(nnRaw));

      const nnCompRaw = localStorage.getItem('sa_nn_completions');
      if (nnCompRaw) setNNCompletions(JSON.parse(nnCompRaw));

      const tasksRaw = localStorage.getItem('sa_daily_tasks');
      if (tasksRaw) setDailyTasks(JSON.parse(tasksRaw));

      const journalRaw = localStorage.getItem('sa_journal_entries');
      if (journalRaw) {
        setJournalEntries(JSON.parse(journalRaw));
      } else {
        const legacyRaw = localStorage.getItem('daily-achievement-tracker');
        if (legacyRaw) {
          try {
            const legacy = JSON.parse(legacyRaw);
            if (legacy.journalEntries?.length) {
              setJournalEntries(legacy.journalEntries);
              localStorage.setItem('sa_journal_entries', JSON.stringify(legacy.journalEntries));
            }
          } catch { /* ignore legacy parse errors */ }
        }
      }

      const docsRaw = localStorage.getItem('sa_system_documents');
      if (docsRaw) setSystemDocuments(JSON.parse(docsRaw));

      const reviewsRaw = localStorage.getItem('sa_reviews');
      if (reviewsRaw) setSavedReviews(JSON.parse(reviewsRaw));

      const reportsRaw = localStorage.getItem('sa_system_reports');
      if (reportsRaw) setSystemReports(JSON.parse(reportsRaw));

      const patchesRaw = localStorage.getItem('sa_read_patches');
      if (patchesRaw) setReadPatches(JSON.parse(patchesRaw));

      const installDateRaw = localStorage.getItem('sa_installation_complete_date');
      if (installDateRaw) setInstallationCompleteDate(installDateRaw);

      const recalRaw = localStorage.getItem('sa_recal_pending');
      if (recalRaw) setRecalPending(JSON.parse(recalRaw));
    } catch (e) {
      console.warn('Failed to load data from localStorage:', e);
    }
    if (!user) setLoading(false);
  }, []);

  // ── Persist to localStorage on change ──
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    localStorage.setItem('sa_non_negotiables', JSON.stringify(nonNegotiables));
    localStorage.setItem('sa_nn_completions', JSON.stringify(nnCompletions));
    localStorage.setItem('sa_daily_tasks', JSON.stringify(dailyTasks));
    localStorage.setItem('sa_journal_entries', JSON.stringify(journalEntries));
    localStorage.setItem('sa_reviews', JSON.stringify(savedReviews));
    localStorage.setItem('sa_system_reports', JSON.stringify(systemReports));
    localStorage.setItem('sa_read_patches', JSON.stringify(readPatches));
    if (installationCompleteDate) {
      localStorage.setItem('sa_installation_complete_date', installationCompleteDate);
    }
    if (recalPending) {
      localStorage.setItem('sa_recal_pending', JSON.stringify(recalPending));
    } else {
      localStorage.removeItem('sa_recal_pending');
    }
  }, [nonNegotiables, nnCompletions, dailyTasks, journalEntries, savedReviews, systemReports, readPatches, installationCompleteDate, recalPending]);

  useEffect(() => {
    if (Object.keys(systemDocuments).length > 0) {
      localStorage.setItem('sa_system_documents', JSON.stringify(systemDocuments));
    }
  }, [systemDocuments]);

  // ── Load from Supabase when authenticated ──
  useEffect(() => {
    if (!user || authLoading || hasLoadedSupabase.current) return;
    hasLoadedSupabase.current = true;
    loadFromSupabase();
  }, [user, authLoading]);

  const loadFromSupabase = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const [nnRes, nnCompRes, tasksRes, journalRes, docsRes, reviewsRes, reportsRes, progressRes] = await Promise.all([
        supabase.from('non_negotiables').select('*').order('order', { ascending: true }),
        supabase.from('nn_completions').select('*').order('completion_date', { ascending: false }),
        supabase.from('daily_tasks').select('*').order('task_date', { ascending: false }),
        supabase.from('journal_entries').select('*').order('entry_date', { ascending: true }),
        supabase.from('system_documents').select('*'),
        supabase.from('saved_reviews').select('*').order('review_date', { ascending: false }),
        supabase.from('system_reports').select('*').order('month', { ascending: false }),
        supabase.from('user_progress').select('*').maybeSingle(),
      ]);

      for (const res of [nnRes, nnCompRes, tasksRes, journalRes, docsRes, reviewsRes, reportsRes]) {
        if (res.error) throw res.error;
      }
      if (progressRes.error && progressRes.error.code !== 'PGRST116') throw progressRes.error;

      const supabaseHasData =
        (nnRes.data?.length ?? 0) > 0 ||
        (tasksRes.data?.length ?? 0) > 0 ||
        (journalRes.data?.length ?? 0) > 0 ||
        (docsRes.data?.length ?? 0) > 0 ||
        (reviewsRes.data?.length ?? 0) > 0 ||
        (reportsRes.data?.length ?? 0) > 0 ||
        progressRes.data != null;

      if (supabaseHasData) {
        // Supabase is source of truth
        setNonNegotiables(
          (nnRes.data || []).map((r: any) => ({
            id: r.id, user_id: r.user_id, title: r.title,
            description: r.description, order: r.order, active: r.active,
            created_at: r.created_at, updated_at: r.updated_at,
          }))
        );
        setNNCompletions(
          (nnCompRes.data || []).map((r: any) => ({
            id: r.id, non_negotiable_id: r.non_negotiable_id,
            user_id: r.user_id, completion_date: r.completion_date,
            created_at: r.created_at,
          }))
        );
        setDailyTasks(
          (tasksRes.data || []).map((r: any) => ({
            id: r.id, user_id: r.user_id, title: r.title,
            description: r.description, task_date: r.task_date,
            time: r.time, completed: r.completed, created_at: r.created_at,
          }))
        );
        setJournalEntries(
          (journalRes.data || []).map((r: any) => ({
            id: r.id, dayNumber: r.day_number, title: r.title,
            content: r.content, entry_date: r.entry_date,
            entry_type: r.entry_type, answers: r.answers,
            lastModified: r.last_modified, userId: r.user_id,
          }))
        );
        if (docsRes.data?.length) {
          const docsMap: Record<string, string> = {};
          docsRes.data.forEach((d: any) => { docsMap[d.doc_type] = d.content; });
          setSystemDocuments(docsMap);
        }
        if (reviewsRes.data?.length) {
          setSavedReviews(reviewsRes.data.map((r: any) => ({
            id: r.id, type: r.review_type, date: r.review_date,
            answers: r.answers || {}, stats: r.stats || undefined,
          })));
        }
        if (reportsRes.data?.length) {
          setSystemReports(reportsRes.data.map((r: any) => ({
            id: r.id, user_id: r.user_id, month: r.month,
            score: r.score, tier: r.tier,
            meetsMinimums: r.meets_minimums, scoreCapped: r.score_capped,
            habitsScore: r.habits_score, habitsCount: r.habits_count,
            tasksScore: r.tasks_score, tasksAvgPerDay: r.tasks_avg_per_day,
            nnScore: r.nn_score, nnCount: r.nn_count,
            totalTasksCompleted: r.total_tasks_completed,
            totalDaysActive: r.total_days_active,
            longestStreak: r.longest_streak,
            personalHighlight: r.personal_highlight,
            scoreDelta: r.score_delta,
            created_at: r.created_at,
            isInstallationReport: r.is_installation_report,
          })));
        }
        if (progressRes.data) {
          setReadPatches(progressRes.data.read_patches || []);
          setInstallationCompleteDate(progressRes.data.installation_complete_date || null);
          setRecalPending(progressRes.data.recal_pending || null);
        }
      } else {
        // Supabase is empty — seed from localStorage
        await seedFromLocalStorage(user.id);
      }
    } catch (e) {
      console.error('Error loading from Supabase:', e);
    } finally {
      setLoading(false);
    }
  };

  // ── Seed Supabase from localStorage data ──
  const seedFromLocalStorage = async (userId: string) => {
    // Read directly from localStorage (state may not be settled yet)
    const localNN: NonNegotiable[] = JSON.parse(localStorage.getItem('sa_non_negotiables') || '[]');
    const localNNComp: NonNegotiableCompletion[] = JSON.parse(localStorage.getItem('sa_nn_completions') || '[]');
    const localTasks: DailyTask[] = JSON.parse(localStorage.getItem('sa_daily_tasks') || '[]');
    const localJournal: JournalEntry[] = JSON.parse(localStorage.getItem('sa_journal_entries') || '[]');
    const localDocs: Record<string, string> = JSON.parse(localStorage.getItem('sa_system_documents') || '{}');

    // Remap string IDs → UUIDs (Supabase id columns are uuid type)
    const nnIdMap = new Map<string, string>();

    if (localNN.length > 0) {
      const rows = localNN.map(nn => {
        const newId = newUUID();
        nnIdMap.set(nn.id, newId);
        return {
          id: newId, user_id: userId, title: nn.title,
          description: nn.description || null,
          order: nn.order, active: nn.active,
          created_at: nn.created_at, updated_at: nn.updated_at,
        };
      });
      const { error } = await supabase.from('non_negotiables').insert(rows);
      if (error) {
        console.error('Error seeding non_negotiables:', error);
      } else {
        setNonNegotiables(rows.map((r, i) => ({
          ...localNN[i], id: r.id, user_id: userId,
        })));
      }
    }

    if (localNNComp.length > 0 && nnIdMap.size > 0) {
      const rows = localNNComp
        .filter(c => nnIdMap.has(c.non_negotiable_id))
        .map(c => ({
          id: newUUID(),
          non_negotiable_id: nnIdMap.get(c.non_negotiable_id)!,
          user_id: userId,
          completion_date: c.completion_date,
          created_at: c.created_at,
        }));
      if (rows.length > 0) {
        const { error } = await supabase.from('nn_completions').insert(rows);
        if (error) {
          console.error('Error seeding nn_completions:', error);
        } else {
          setNNCompletions(rows);
        }
      }
    }

    if (localTasks.length > 0) {
      const rows = localTasks.map(t => ({
        id: newUUID(), user_id: userId, title: t.title,
        description: t.description || null, task_date: t.task_date,
        time: t.time || null, completed: t.completed, created_at: t.created_at,
      }));
      const { error } = await supabase.from('daily_tasks').insert(rows);
      if (error) {
        console.error('Error seeding daily_tasks:', error);
      } else {
        setDailyTasks(rows.map((r, i) => ({ ...localTasks[i], id: r.id, user_id: userId })));
      }
    }

    if (localJournal.length > 0) {
      const rows = localJournal.map(e => ({
        id: newUUID(), user_id: userId,
        day_number: e.dayNumber ?? null, title: e.title,
        content: e.content, entry_date: e.entry_date,
        entry_type: e.entry_type, answers: e.answers || {},
        last_modified: e.lastModified,
      }));
      const { error } = await supabase.from('journal_entries').insert(rows);
      if (error) {
        console.error('Error seeding journal_entries:', error);
      } else {
        setJournalEntries(rows.map((r, i) => ({
          ...localJournal[i], id: r.id, userId: userId,
        })));
      }
    }

    const docEntries = Object.entries(localDocs).filter(([, v]) => v.trim());
    if (docEntries.length > 0) {
      const rows = docEntries.map(([docType, content]) => ({
        id: newUUID(), user_id: userId, doc_type: docType, content,
      }));
      const { error } = await supabase.from('system_documents').insert(rows);
      if (error) console.error('Error seeding system_documents:', error);
    }

    // Seed saved_reviews
    const localReviews: SavedReview[] = JSON.parse(localStorage.getItem('sa_reviews') || '[]');
    if (localReviews.length > 0) {
      const rows = localReviews.map(r => ({
        user_id: userId,
        review_type: r.type, review_date: r.date,
        answers: r.answers, stats: r.stats || null,
      }));
      const { error } = await supabase.from('saved_reviews').insert(rows);
      if (error) console.error('Error seeding saved_reviews:', error);
    }

    // Seed system_reports
    const localReports: SystemReport[] = JSON.parse(localStorage.getItem('sa_system_reports') || '[]');
    if (localReports.length > 0) {
      const rows = localReports.map(r => ({
        user_id: userId, month: r.month,
        score: r.score, tier: r.tier,
        meets_minimums: r.meetsMinimums, score_capped: r.scoreCapped,
        habits_score: r.habitsScore, habits_count: r.habitsCount,
        tasks_score: r.tasksScore, tasks_avg_per_day: r.tasksAvgPerDay,
        nn_score: r.nnScore, nn_count: r.nnCount,
        total_tasks_completed: r.totalTasksCompleted,
        total_days_active: r.totalDaysActive,
        longest_streak: r.longestStreak,
        personal_highlight: r.personalHighlight,
        score_delta: r.scoreDelta ?? null,
        is_installation_report: r.isInstallationReport ?? false,
      }));
      const { error } = await supabase.from('system_reports').insert(rows);
      if (error) console.error('Error seeding system_reports:', error);
    }

    // Seed user_progress
    const localReadPatches: string[] = JSON.parse(localStorage.getItem('sa_read_patches') || '[]');
    const localInstallDate = localStorage.getItem('sa_installation_complete_date') || null;
    const localRecalPending = JSON.parse(localStorage.getItem('sa_recal_pending') || 'null');
    if (localReadPatches.length > 0 || localInstallDate || localRecalPending) {
      const { error } = await supabase.from('user_progress').upsert({
        user_id: userId,
        read_patches: localReadPatches,
        installation_complete_date: localInstallDate,
        recal_pending: localRecalPending,
      }, { onConflict: 'user_id' });
      if (error) console.error('Error seeding user_progress:', error);
    }
  };

  // ═══════════════════════════════════════════
  // Mutation functions (dual-mode write-through)
  // ═══════════════════════════════════════════

  const handleToggleNN = useCallback(async (nn: NonNegotiable, date: string) => {
    const existing = nnCompletionsRef.current.find(
      c => c.non_negotiable_id === nn.id && c.completion_date === date
    );
    if (existing) {
      setNNCompletions(prev => prev.filter(c => c.id !== existing.id));
      if (user) {
        await supabase.from('nn_completions').delete().eq('id', existing.id);
      }
    } else {
      const completion: NonNegotiableCompletion = {
        id: user ? newUUID() : uid(),
        non_negotiable_id: nn.id,
        user_id: user?.id || 'local',
        completion_date: date,
        created_at: new Date().toISOString(),
      };
      setNNCompletions(prev => [...prev, completion]);
      if (user) {
        await supabase.from('nn_completions').insert({
          id: completion.id, non_negotiable_id: nn.id,
          user_id: user.id, completion_date: date,
        });
      }
    }
  }, [user]);

  const addNonNegotiable = useCallback(async (nn: NonNegotiable) => {
    const finalNN = user ? { ...nn, id: newUUID(), user_id: user.id } : nn;
    setNonNegotiables(prev => [...prev, finalNN]);
    if (user) {
      await supabase.from('non_negotiables').insert({
        id: finalNN.id, user_id: user.id, title: finalNN.title,
        description: finalNN.description || null,
        order: finalNN.order, active: finalNN.active,
      });
    }
    return finalNN;
  }, [user]);

  const deleteNonNegotiable = useCallback(async (id: string) => {
    setNonNegotiables(prev => prev.filter(n => n.id !== id));
    setNNCompletions(prev => prev.filter(c => c.non_negotiable_id !== id));
    if (user) {
      await supabase.from('nn_completions').delete().eq('non_negotiable_id', id);
      await supabase.from('non_negotiables').delete().eq('id', id);
    }
  }, [user]);

  const updateNonNegotiable = useCallback(async (id: string, updates: { title?: string; description?: string }) => {
    setNonNegotiables(prev => prev.map(n => n.id === id ? { ...n, ...updates, updated_at: new Date().toISOString() } : n));
    if (user) {
      await supabase.from('non_negotiables').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id);
    }
  }, [user]);

  const addDailyTask = useCallback(async (task: DailyTask) => {
    const finalTask = user ? { ...task, id: newUUID(), user_id: user.id } : task;
    setDailyTasks(prev => [...prev, finalTask]);
    if (user) {
      await supabase.from('daily_tasks').insert({
        id: finalTask.id, user_id: user.id, title: finalTask.title,
        description: finalTask.description || null,
        task_date: finalTask.task_date, time: finalTask.time || null,
        completed: finalTask.completed,
      });
    }
    return finalTask;
  }, [user]);

  const toggleDailyTask = useCallback(async (id: string) => {
    const task = dailyTasksRef.current.find(t => t.id === id);
    if (!task) return;
    const newCompleted = !task.completed;
    setDailyTasks(prev =>
      prev.map(t => t.id === id ? { ...t, completed: newCompleted } : t)
    );
    if (user) {
      await supabase.from('daily_tasks').update({ completed: newCompleted }).eq('id', id);
    }
  }, [user]);

  const deleteDailyTask = useCallback(async (id: string) => {
    setDailyTasks(prev => prev.filter(t => t.id !== id));
    if (user) {
      await supabase.from('daily_tasks').delete().eq('id', id);
    }
  }, [user]);

  const updateJournalEntry = useCallback(async (entry: JournalEntry) => {
    const existing = journalEntriesRef.current.find(e => e.dayNumber === entry.dayNumber);
    const entryId = existing?.id || (user ? newUUID() : uid());
    const finalEntry = { ...entry, id: entryId, userId: user?.id };

    setJournalEntries(prev => {
      if (existing) {
        return prev.map(e => e.dayNumber === entry.dayNumber ? finalEntry : e);
      }
      return [...prev, finalEntry];
    });

    if (user) {
      const { error } = await supabase.from('journal_entries').upsert({
        id: entryId, user_id: user.id,
        day_number: entry.dayNumber ?? null, title: entry.title,
        content: entry.content, entry_date: entry.entry_date,
        entry_type: entry.entry_type, answers: entry.answers || {},
        last_modified: entry.lastModified,
      });
      if (error) console.error('Error saving journal entry:', error);
    }
  }, [user]);

  const updateSystemDocument = useCallback(async (key: string, content: string) => {
    setSystemDocuments(prev => ({ ...prev, [key]: content }));

    if (user) {
      const { data: existing } = await supabase
        .from('system_documents')
        .select('id')
        .eq('user_id', user.id)
        .eq('doc_type', key)
        .maybeSingle();

      if (existing) {
        await supabase.from('system_documents')
          .update({ content, updated_at: new Date().toISOString() })
          .eq('id', existing.id);
      } else {
        await supabase.from('system_documents')
          .insert({ user_id: user.id, doc_type: key, content });
      }
    }
  }, [user]);

  const saveSavedReview = useCallback(async (review: SavedReview) => {
    setSavedReviews(prev => [review, ...prev]);
    if (user) {
      await supabase.from('saved_reviews').insert({
        user_id: user.id,
        review_type: review.type, review_date: review.date,
        answers: review.answers, stats: review.stats || null,
      });
    }
  }, [user]);

  const saveSystemReport = useCallback(async (report: SystemReport) => {
    setSystemReports(prev => {
      const filtered = prev.filter(r => r.month !== report.month);
      return [...filtered, report];
    });
    if (user) {
      // Delete existing report for this month (if any), then insert fresh
      await supabase.from('system_reports')
        .delete()
        .eq('user_id', user.id)
        .eq('month', report.month);
      await supabase.from('system_reports').insert({
        user_id: user.id, month: report.month,
        score: report.score, tier: report.tier,
        meets_minimums: report.meetsMinimums, score_capped: report.scoreCapped,
        habits_score: report.habitsScore, habits_count: report.habitsCount,
        tasks_score: report.tasksScore, tasks_avg_per_day: report.tasksAvgPerDay,
        nn_score: report.nnScore, nn_count: report.nnCount,
        total_tasks_completed: report.totalTasksCompleted,
        total_days_active: report.totalDaysActive,
        longest_streak: report.longestStreak,
        personal_highlight: report.personalHighlight,
        score_delta: report.scoreDelta ?? null,
        is_installation_report: report.isInstallationReport ?? false,
      });
    }
  }, [user]);

  const updateReadPatches = useCallback(async (patches: string[]) => {
    setReadPatches(patches);
    if (user) {
      await supabase.from('user_progress').upsert({
        user_id: user.id, read_patches: patches,
      }, { onConflict: 'user_id' });
    }
  }, [user]);

  const updateInstallationDate = useCallback(async (date: string) => {
    setInstallationCompleteDate(date);
    if (user) {
      await supabase.from('user_progress').upsert({
        user_id: user.id, installation_complete_date: date,
      }, { onConflict: 'user_id' });
    }
  }, [user]);

  const updateRecalPending = useCallback(async (data: object | null) => {
    setRecalPending(data);
    if (user) {
      await supabase.from('user_progress').upsert({
        user_id: user.id, recal_pending: data,
      }, { onConflict: 'user_id' });
    }
  }, [user]);

  const clearAll = useCallback(() => {
    setNonNegotiables([]);
    setNNCompletions([]);
    setDailyTasks([]);
    setJournalEntries([]);
    setSystemDocuments({});
    setSavedReviews([]);
    setSystemReports([]);
    setReadPatches([]);
    setInstallationCompleteDate(null);
    setRecalPending(null);
    hasLoadedSupabase.current = false;
  }, []);

  return {
    // State
    nonNegotiables,
    nnCompletions,
    dailyTasks,
    journalEntries,
    systemDocuments,
    savedReviews,
    systemReports,
    readPatches,
    installationCompleteDate,
    recalPending,

    // Mutations
    handleToggleNN,
    addNonNegotiable,
    deleteNonNegotiable,
    updateNonNegotiable,
    addDailyTask,
    toggleDailyTask,
    deleteDailyTask,
    updateJournalEntry,
    updateSystemDocument,
    saveSavedReview,
    saveSystemReport,
    updateReadPatches,
    updateInstallationDate,
    updateRecalPending,

    // Utility
    loading: loading,
    clearAll,
  };
}
