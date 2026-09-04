'use client'

import { useEffect, useState } from 'react'
import { supabase, Computer } from '@/lib/supabase'

export default function ComputersPage() {
  const [computers, setComputers] = useState<Computer[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [filterLocation, setFilterLocation] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [form, setForm] = useState({
    computer_name: '', location: '', status: 'Active',
    os_version: '', specs: '', notes: '',
  })

  async function loadComputers() {
    let query = supabase.from('computers').select('*').order('location').order('computer_name')
    if (filterLocation) query = query.eq('location', filterLocation)
    if (filterStatus) query = query.eq('status', filterStatus)
    const { data } = await query
    if (data) setComputers(data)
    setLoading(false)
  }

  useEffect(() => { loadComputers() }, [filterLocation, filterStatus])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const { error } = await supabase.from('computers').insert({
      computer_name: form.computer_name,
      location: form.location,
      status: form.status,
      os_version: form.os_version || null,
      specs: form.specs || null,
      notes: form.notes || null,
    })
    if (error) { alert(error.message); return }
    setForm({ computer_name: '', location: '', status: 'Active', os_version: '', specs: '', notes: '' })
    setShowForm(false)
    loadComputers()
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this computer? This will also remove its installations.')) return
    await supabase.from('computers').delete().eq('computer_id', id)
    loadComputers()
  }

  const locations = [...new Set(computers.map(c => c.location))].sort()

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Computers</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          {showForm ? 'Cancel' : '+ Add Computer'}
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold">Add New Computer</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Computer Name" required value={form.computer_name}
              onChange={v => setForm({ ...form, computer_name: v })} />
            <Input label="Location" required value={form.location}
              onChange={v => setForm({ ...form, location: v })} placeholder="e.g. Lab 204" />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                <option>Active</option><option>Inactive</option>
                <option>Maintenance</option><option>Retired</option>
              </select>
            </div>
            <Input label="OS Version" value={form.os_version}
              onChange={v => setForm({ ...form, os_version: v })} />
            <Input label="Specs" value={form.specs}
              onChange={v => setForm({ ...form, specs: v })} />
            <Input label="Notes" value={form.notes}
              onChange={v => setForm({ ...form, notes: v })} />
          </div>
          <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 text-sm font-medium">
            Save Computer
          </button>
        </form>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <select value={filterLocation} onChange={e => setFilterLocation(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white">
          <option value="">All Locations</option>
          {locations.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white">
          <option value="">All Statuses</option>
          <option>Active</option><option>Inactive</option>
          <option>Maintenance</option><option>Retired</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" /></div>
      ) : (
        <>
          <p className="text-sm text-gray-500">{computers.length} computer(s)</p>
          {/* Mobile Cards */}
          <div className="grid grid-cols-1 md:hidden gap-3">
            {computers.map(c => (
              <div key={c.computer_id} className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold text-gray-900">{c.computer_name}</div>
                    <div className="text-sm text-gray-500">{c.location}</div>
                  </div>
                  <StatusBadge status={c.status} />
                </div>
                {c.os_version && <div className="text-sm text-gray-600 mt-2">{c.os_version}</div>}
                {c.specs && <div className="text-xs text-gray-500 mt-1">{c.specs}</div>}
                <button onClick={() => handleDelete(c.computer_id)}
                  className="text-red-600 text-xs mt-2 hover:underline">Delete</button>
              </div>
            ))}
          </div>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg shadow text-sm">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Location</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">OS</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Specs</th>
                  <th className="py-3 px-4"></th>
                </tr>
              </thead>
              <tbody>
                {computers.map(c => (
                  <tr key={c.computer_id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{c.computer_name}</td>
                    <td className="py-3 px-4">{c.location}</td>
                    <td className="py-3 px-4"><StatusBadge status={c.status} /></td>
                    <td className="py-3 px-4 text-gray-600">{c.os_version ?? '—'}</td>
                    <td className="py-3 px-4 text-gray-500 max-w-xs truncate">{c.specs ?? '—'}</td>
                    <td className="py-3 px-4">
                      <button onClick={() => handleDelete(c.computer_id)}
                        className="text-red-600 hover:underline text-xs">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    Active: 'bg-green-100 text-green-800',
    Inactive: 'bg-gray-100 text-gray-800',
    Maintenance: 'bg-yellow-100 text-yellow-800',
    Retired: 'bg-red-100 text-red-800',
  }
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
      {status}
    </span>
  )
}

function Input({ label, value, onChange, required, placeholder }: {
  label: string; value: string; onChange: (v: string) => void;
  required?: boolean; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type="text" value={value} onChange={e => onChange(e.target.value)}
        required={required} placeholder={placeholder}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
  )
}
