import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://fyfckhzykbblktivgbik.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5ZmNraHp5a2JibGt0aXZnYmlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTA4ODY3OTgsImV4cCI6MjAyNjQ2Mjc5OH0.1cet5sxfkgZDk-mmWcgInJ7iu9DBefGWpMS_Mv7uKfc'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})