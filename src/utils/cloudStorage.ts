import { supabase } from '../lib/supabase'
import { Entry, Category, Converter, Task, Goal, JournalEntry, ScheduleItem } from '../types'

export interface CloudStorageData {
  entries: Entry[]
  categories: Category[]
  converters: Converter[]
  tasks: Task[]
  goals: Goal[]
  journalEntries: JournalEntry[]
  scheduleItems: ScheduleItem[]
  updated_at: string
}

export async function saveToCloud(data: {
  entries: Entry[]
  categories: Category[]
  converters: Converter[]
  tasks: Task[]
  goals: Goal[]
  journalEntries: JournalEntry[]
  scheduleItems: ScheduleItem[]
}): Promise<{ error?: any }> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    const cloudData: CloudStorageData = {
      ...data,
      updated_at: new Date().toISOString()
    }

    const { error } = await supabase
      .from('user_data')
      .upsert({
        user_id: user.id,
        data: cloudData
      }, { onConflict: 'user_id' })

    return { error }
  } catch (error) {
    return { error }
  }
}

export async function loadFromCloud(): Promise<{
  data?: CloudStorageData
  error?: any
}> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    const { data, error } = await supabase
      .from('user_data')
      .select('data')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      return { error }
    }

    return { data: data?.data || null }
  } catch (error) {
    return { error }
  }
}