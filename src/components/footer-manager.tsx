'use client'

import { useEffect, useState, useCallback } from 'react'
import { PanelBottom, Plus, Trash2, Loader2, RotateCcw, Save, Check } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { FOOTER_DEFAULTS, type FooterSettings, type FooterLink } from '@/lib/site-settings'

const EMPTY_LINK: FooterLink = { label: '', href: '' }

export function FooterManager() {
  const { toast } = useToast()
  const [settings, setSettings] = useState<FooterSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [dirty, setDirty] = useState(false)

  const refresh = useCallback(() => {
    setLoading(true)
    fetch('/api/footer-settings', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        if (data?.data) setSettings({ ...FOOTER_DEFAULTS, ...data.data })
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false)
        setDirty(false)
      })
  }, [])

  useEffect(() => { refresh() }, [refresh])

  // Field setters — each marks the form dirty.
  function setField<K extends keyof FooterSettings>(key: K, value: FooterSettings[K]) {
    setSettings((prev) => prev ? { ...prev, [key]: value } : prev)
    setDirty(true)
  }

  function updateLink(
    arr: 'hotelPortal' | 'tourismPortal' | 'bottomLinks',
    index: number,
    patch: Partial<FooterLink>
  ) {
    setSettings((prev) => {
      if (!prev) return prev
      const next = [...prev[arr]]
      next[index] = { ...next[index], ...patch }
      return { ...prev, [arr]: next }
    })
    setDirty(true)
  }

  function addLink(arr: 'hotelPortal' | 'tourismPortal' | 'bottomLinks') {
    setSettings((prev) => prev ? { ...prev, [arr]: [...prev[arr], { ...EMPTY_LINK }] } : prev)
    setDirty(true)
  }

  function removeLink(arr: 'hotelPortal' | 'tourismPortal' | 'bottomLinks', index: number) {
    setSettings((prev) => {
      if (!prev) return prev
      const next = prev[arr].filter((_, i) => i !== index)
      return { ...prev, [arr]: next }
    })
    setDirty(true)
  }

  async function handleSave() {
    if (!settings) return
    // Light client-side validation: trim & drop totally-empty links.
    const cleaned: FooterSettings = {
      ...settings,
      hotelPortal: settings.hotelPortal
        .map((l) => ({ label: l.label.trim(), href: l.href.trim() }))
        .filter((l) => l.label || l.href),
      tourismPortal: settings.tourismPortal
        .map((l) => ({ label: l.label.trim(), href: l.href.trim() }))
        .filter((l) => l.label || l.href),
      bottomLinks: settings.bottomLinks
        .map((l) => ({ label: l.label.trim(), href: l.href.trim() }))
        .filter((l) => l.label || l.href),
    }
    setSaving(true)
    try {
      const res = await fetch('/api/footer-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleaned),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || `Save failed (${res.status})`)
      }
      const data = await res.json()
      setSettings({ ...FOOTER_DEFAULTS, ...(data.data ?? cleaned) })
      setDirty(false)
      toast({ title: 'Footer saved', description: 'Public pages now show the updated footer.' })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Save failed'
      toast({ title: 'Save failed', description: msg, variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  async function handleReset() {
    setResetting(true)
    try {
      const res = await fetch('/api/footer-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(FOOTER_DEFAULTS),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || `Reset failed (${res.status})`)
      }
      const data = await res.json()
      setSettings({ ...FOOTER_DEFAULTS, ...(data.data ?? FOOTER_DEFAULTS) })
      setDirty(false)
      toast({ title: 'Reverted to defaults', description: 'The footer is back to its original content.' })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Reset failed'
      toast({ title: 'Reset failed', description: msg, variant: 'destructive' })
    } finally {
      setResetting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <PanelBottom className="h-5 w-5 text-primary" />
          Footer Editor
        </CardTitle>
        <CardDescription>
          Edit the brand block, portal link lists, contact info, copyright, and
          bottom-bar links shown in the public site footer. Changes are saved to
          the server and appear on every page immediately.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading || !settings ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Brand block */}
            <Section title="Brand">
              <Field label="Brand name" value={settings.brandName} onChange={(v) => setField('brandName', v)} />
              <Field label="Tagline" value={settings.brandTagline} onChange={(v) => setField('brandTagline', v)} />
              <Field
                label="Description"
                value={settings.brandDescription}
                onChange={(v) => setField('brandDescription', v)}
                textarea
              />
            </Section>

            {/* Hotel portal links */}
            <LinkListSection
              title="Hotel Portal"
              sectionTitle={settings.hotelPortalTitle}
              links={settings.hotelPortal}
              onTitleChange={(v) => setField('hotelPortalTitle', v)}
              onAdd={() => addLink('hotelPortal')}
              onRemove={(i) => removeLink('hotelPortal', i)}
              onUpdate={(i, patch) => updateLink('hotelPortal', i, patch)}
            />

            {/* Tourism portal links */}
            <LinkListSection
              title="Tourism Portal"
              sectionTitle={settings.tourismPortalTitle}
              links={settings.tourismPortal}
              onTitleChange={(v) => setField('tourismPortalTitle', v)}
              onAdd={() => addLink('tourismPortal')}
              onRemove={(i) => removeLink('tourismPortal', i)}
              onUpdate={(i, patch) => updateLink('tourismPortal', i, patch)}
            />

            {/* Contact info */}
            <Section title="Contact">
              <Field label="Section title" value={settings.contactTitle} onChange={(v) => setField('contactTitle', v)} />
              <Field label="Email" value={settings.email} onChange={(v) => setField('email', v)} />
              <Field label="Primary phone" value={settings.phonePrimary} onChange={(v) => setField('phonePrimary', v)} />
              <Field label="Secondary phone" value={settings.phoneSecondary} onChange={(v) => setField('phoneSecondary', v)} />
              <Field label="Address" value={settings.address} onChange={(v) => setField('address', v)} textarea />
            </Section>

            {/* Bottom bar */}
            <Section title="Copyright & Bottom Bar">
              <Field label="Copyright text" value={settings.copyright} onChange={(v) => setField('copyright', v)} />
              <LinkListSection
                title="Bottom Links"
                sectionTitle=""
                hideSectionTitle
                links={settings.bottomLinks}
                onTitleChange={() => {}}
                onAdd={() => addLink('bottomLinks')}
                onRemove={(i) => removeLink('bottomLinks', i)}
                onUpdate={(i, patch) => updateLink('bottomLinks', i, patch)}
              />
            </Section>

            {/* Action bar */}
            <div className="flex flex-wrap items-center gap-3 pt-4 border-t">
              <Button onClick={handleSave} disabled={saving || !dirty} className="gap-1.5">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : dirty ? <Save className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                {saving ? 'Saving…' : dirty ? 'Save changes' : 'Saved'}
              </Button>
              <Button onClick={handleReset} disabled={resetting || saving} variant="outline" className="gap-1.5">
                {resetting ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
                {resetting ? 'Resetting…' : 'Reset to defaults'}
              </Button>
              {dirty && (
                <span className="text-xs text-amber-700">Unsaved changes</span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ── Sub-components ───────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{title}</p>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

function LinkListSection({
  title,
  sectionTitle,
  links,
  hideSectionTitle,
  onTitleChange,
  onAdd,
  onRemove,
  onUpdate,
}: {
  title: string
  sectionTitle: string
  links: FooterLink[]
  hideSectionTitle?: boolean
  onTitleChange: (v: string) => void
  onAdd: () => void
  onRemove: (i: number) => void
  onUpdate: (i: number, patch: Partial<FooterLink>) => void
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{title}</p>
        <Button size="sm" variant="outline" onClick={onAdd} className="gap-1.5 h-7 px-2 text-xs">
          <Plus className="h-3.5 w-3.5" /> Add link
        </Button>
      </div>
      {!hideSectionTitle && (
        <Field label="Section title" value={sectionTitle} onChange={onTitleChange} />
      )}
      <div className="space-y-2">
        {links.length === 0 && (
          <p className="text-xs text-muted-foreground italic px-1">No links yet — click “Add link”.</p>
        )}
        {links.map((l, i) => (
          <div key={i} className="flex items-center gap-2">
            <Input
              value={l.label}
              placeholder="Label"
              onChange={(e) => onUpdate(i, { label: e.target.value })}
              className="flex-1"
            />
            <Input
              value={l.href}
              placeholder="https:// or #anchor"
              onChange={(e) => onUpdate(i, { href: e.target.value })}
              className="flex-1"
            />
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onRemove(i)}
              className="text-muted-foreground hover:text-destructive h-9 w-9 p-0"
              title="Remove link"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  textarea,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  textarea?: boolean
}) {
  return (
    <label className="block space-y-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-y"
        />
      ) : (
        <Input value={value} onChange={(e) => onChange(e.target.value)} />
      )}
    </label>
  )
}
