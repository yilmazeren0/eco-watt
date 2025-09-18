import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://spfaotvpqvtuwvkgnoez.supabase.co'
const supabasePublishableKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwZmFvdHZwcXZ0dXd2a2dub2V6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxMDk0MTEsImV4cCI6MjA3MzY4NTQxMX0.WQcijM49WAvyVVpp8_32Ws2SUcKjlHe_8c4h8hI5Ujs'

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  }
})