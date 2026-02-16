import { useState, useEffect } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { getDevOverride, setDevOverride, isDevEnvironment } from '../utils/devUtils'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [plan, setPlan] = useState<'free' | 'paid'>('free')
  const [trialEndsAt, setTrialEndsAt] = useState<string | null>(null)
  const [planSource, setPlanSource] = useState<'profile' | 'dev-override'>('profile')

  const loadUserPlan = async (userId: string) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('plan, trial_ends_at')
      .eq('id', userId)
      .maybeSingle()

    if (error) {
      console.error('Error loading user plan:', error)
      setPlan('free')
      setTrialEndsAt(null)
      setPlanSource('profile')
      return
    }

    if (data) {
      setPlan(data.plan as 'free' | 'paid')
      setTrialEndsAt(data.trial_ends_at)
      setPlanSource('profile')
    } else {
      setPlan('free')
      setTrialEndsAt(null)
      setPlanSource('profile')
    }
  }

  const applyDevOverride = () => {
    if (!isDevEnvironment()) return

    const override = getDevOverride()
    if (override.plan) {
      if (override.plan === 'trial') {
        setPlan('free')
        setTrialEndsAt(override.trialEndsAt)
      } else {
        setPlan(override.plan as 'free' | 'paid')
        setTrialEndsAt(null)
      }
      setPlanSource('dev-override')
    }
  }

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        loadUserPlan(session.user.id)
      } else {
        setPlan('free')
        setTrialEndsAt(null)
        setPlanSource('profile')
        applyDevOverride()
      }
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        (async () => {
          await loadUserPlan(session.user.id)
          setLoading(false)
        })()
      } else {
        setPlan('free')
        setTrialEndsAt(null)
        setPlanSource('profile')
        applyDevOverride()
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: undefined,
        data: {}
      }
    })

    if (error) {
      console.error('Sign up error:', error)
    }

    if (!error && data.user) {
      console.log('User created successfully:', data.user.id)
    }

    return { data, error }
  }

  const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error('Sign in error:', error)
  }

  if (!error && data.session) {
    setSession(data.session)
    setUser(data.session.user)

    // 🔹 NEW: sync Whop tier
    await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sync-whop-tier`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${data.session.access_token}`,
      },
      body: JSON.stringify({})
    })

    await loadUserPlan(data.session.user.id)
  }

  return { data, error }
}

  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  const startTrial = async () => {
    if (!user) return { error: new Error('User not authenticated') }

    const trialEndsAt = new Date()
    trialEndsAt.setDate(trialEndsAt.getDate() + 7)

    const { data, error } = await supabase
      .from('user_profiles')
      .update({ trial_ends_at: trialEndsAt.toISOString() })
      .eq('id', user.id)
      .select()
      .maybeSingle()

    if (!error && data) {
      setTrialEndsAt(data.trial_ends_at)
    }

    return { data, error }
  }

  const devSetFreePlan = async () => {
    if (!user) return { error: new Error('User not authenticated') }

    const { data, error } = await supabase
      .from('user_profiles')
      .update({ plan: 'free', trial_ends_at: null })
      .eq('id', user.id)
      .select()
      .maybeSingle()

    if (!error && data) {
      setPlan('free')
      setTrialEndsAt(null)
    }

    return { data, error }
  }

  const devStartTrial = async () => {
    if (!user) return { error: new Error('User not authenticated') }

    const trialEndsAt = new Date()
    trialEndsAt.setDate(trialEndsAt.getDate() + 7)

    const { data, error } = await supabase
      .from('user_profiles')
      .update({ plan: 'free', trial_ends_at: trialEndsAt.toISOString() })
      .eq('id', user.id)
      .select()
      .maybeSingle()

    if (!error && data) {
      setPlan('free')
      setTrialEndsAt(data.trial_ends_at)
    }

    return { data, error }
  }

  const devSetPaidPlan = async () => {
    if (!user) {
      if (isDevEnvironment()) {
        setDevOverride('paid', null)
        setPlan('paid')
        setTrialEndsAt(null)
        setPlanSource('dev-override')
        return { data: null, error: null }
      }
      return { error: new Error('User not authenticated') }
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .update({ plan: 'paid', trial_ends_at: null })
      .eq('id', user.id)
      .select()
      .maybeSingle()

    if (!error && data) {
      setPlan('paid')
      setTrialEndsAt(null)
      setPlanSource('profile')
    }

    return { data, error }
  }

  const devSetFreeLocal = async () => {
    if (!user && isDevEnvironment()) {
      setDevOverride('free', null)
      setPlan('free')
      setTrialEndsAt(null)
      setPlanSource('dev-override')
      return { data: null, error: null }
    }
    return devSetFreePlan()
  }

  const devStartTrialLocal = async () => {
    if (!user && isDevEnvironment()) {
      const trialEndsAt = new Date()
      trialEndsAt.setDate(trialEndsAt.getDate() + 7)
      const trialEndsAtString = trialEndsAt.toISOString()
      setDevOverride('trial', trialEndsAtString)
      setPlan('free')
      setTrialEndsAt(trialEndsAtString)
      setPlanSource('dev-override')
      return { data: null, error: null }
    }
    return devStartTrial()
  }

  const devSetPaidLocal = async () => {
    return devSetPaidPlan()
  }

  return {
    user,
    session,
    loading,
    plan,
    trialEndsAt,
    planSource,
    signUp,
    signIn,
    signOut,
    startTrial,
    devSetFreePlan: devSetFreeLocal,
    devStartTrial: devStartTrialLocal,
    devSetPaidPlan: devSetPaidLocal,
  }
}