import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createClient } from '@supabase/supabase-js'
import App from './App'

const supabaseUrl = 'https://iagjjxdxyjobyffyxopm.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlhZ2pqeGR4eWpvYnlmZnl4b3BtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYwODgzNjIsImV4cCI6MjA2MTY2NDM2Mn0.smd5UNB9hgVAunj277hjSU0uV08lOgn75OpvvP8Xs9w'
export const supabase = createClient(supabaseUrl, supabaseKey)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
