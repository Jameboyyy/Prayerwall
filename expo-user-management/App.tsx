import 'react-native-url-polyfill/auto'
import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Auth from './components/Auth'
import Account from './components/Account'
import { View } from 'react-native'
import { Session } from '@supabase/supabase-js'
import { useFonts } from 'expo-font'

export default function App() {

  let [fontsLoaded] =  useFonts({
    'JosefinSans-Regular': require('./fonts/JosefinSans-Regular.ttf'),
    'JosefinSans-SemiBoldItalic': require('./fonts/JosefinSans-SemiBoldItalic.ttf'),
  })


  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])

  return (
    <View>
      {session && session.user ? <Account key={session.user.id} session={session} /> : <Auth />}
    </View>
  )
}