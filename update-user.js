// update-user.js
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    'https://твой-project.supabase.co',
    'твой-service-role-key'
)

async function updateUser() {
  const { data, error } = await supabase.auth.admin.updateUserById(
      'c72af79b-2b1c-43c1-b369-3192dd51c7be',
      { user_metadata: { full_name: 'Маша' } }
  )

  if (error) console.error(error)
  else console.log('✅ Обновлено:', data)
}

void updateUser()