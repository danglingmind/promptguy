"use client"

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function SettingsPage() {
  const [username, setUsername] = useState<string>('')
  const [available, setAvailable] = useState<boolean | null>(null)
  const [checking, setChecking] = useState<boolean>(false)
  const [saving, setSaving] = useState<boolean>(false)

  const isBasicValid = useMemo(() => {
    const t = username.trim()
    return t.length >= 5 && /^[a-zA-Z0-9]+$/.test(t)
  }, [username])

  useEffect(() => {
    if (!isBasicValid) { setAvailable(null); return }
    const controller = new AbortController()
    const id = setTimeout(async () => {
      try {
        setChecking(true)
        const res = await fetch(`/api/user/username/availability?u=${encodeURIComponent(username)}`, { signal: controller.signal })
        if (!res.ok) return
        const data = await res.json() as { available: boolean }
        setAvailable(Boolean(data.available))
      } catch {
        // ignore
      } finally {
        setChecking(false)
      }
    }, 300)
    return () => { clearTimeout(id); controller.abort() }
  }, [username, isBasicValid])

  async function handleSave() {
    if (!isBasicValid || available === false) return
    try {
      setSaving(true)
      const res = await fetch('/api/user/username', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        toast.error(data.error || 'Failed to update username')
        return
      }
      toast.success('Username updated')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <label className="text-sm font-medium">Username</label>
            <Input value={username} onChange={e => setUsername(e.target.value)} placeholder="Your username" />
            <div className="text-sm">
              {checking && <span className="text-muted-foreground">Checking availability…</span>}
              {!checking && available === true && <span className="text-green-600">Available</span>}
              {!checking && available === false && <span className="text-red-600">Not available</span>}
            </div>
            <Button onClick={handleSave} disabled={!isBasicValid || available === false || saving}>Save changes</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
