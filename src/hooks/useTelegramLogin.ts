'use client'

import {useState} from 'react'

const useTelegramLogin = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState<boolean>(false)

  const login = async (telegramData: any) => {
    try {
      setLoading(true)
      const res = await fetch('/api/auth/telegram', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({credentials: telegramData}),
      })

      if (res.ok) {
        const userRes = await fetch('/api/getData')
        const userData = await userRes.json()
        setUser(userData)
      } else {
        console.error('Login failed')
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return {user, login, isLoading: loading}
}

export default useTelegramLogin
