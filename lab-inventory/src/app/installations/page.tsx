'use client'

import { useEffect, useState } from 'react'
import { supabase, Computer, SoftwareLicense, Installation } from '@/lib/supabase'

export default function InstallationsPage() {
  const [installations, setInstallations] = useState<Installation[]>([])
  const [computers, setComputers] = useState<Computer[]>([])
  const [licenses, setLicenses] = useState<SoftwareLicense[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ computer_id: '', license_id: '', install_date: '', notes: '' })

  async function loadAll() {
    const [instRes, compRes, licRes] = await Promise.all([
      supabase.from('installations').select('*, computers(*), software_licenses(*)').order('install_date', { ascending: false }),
      supabase.from('computers').select('*').eq('status', 'Active').order('computer_name'),
      supabase.from('software_licenses').select('*').order('software_name'),
    ])
    if (instRes.data) setInstallations(instRes.data)
    if (compRes.data) setComputers(compRes.data)
    if (licRes.data) setLicenses(licRes.data)
    setLoading(false)
  }

  useEffect(() => { loadAll() }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const { error } = await supabase.from('installations').insert({
      computer_id: parseInt(form.computer_id),
      license_id: parseInt(form.license_id),
      install_date: form.install_date || new Date().toISOString().split('T')[0],
      notes: form.notes || null,
    })
    if (error) {
      if (error.code === '23505') {
        alert('This software is already installed on this computer.')
      } else {
        alert(error.message)
      }
      return
    }
    setForm({ computer_id: '', license_id: '', install_date: '', notes: '' })
    setShowForm(false)
    loadAll()
  }

  async function handleDelete(id: number) {
    if (!confirm('Remove this installation?')) return
    await supabase.from('installations').delete().eq('install_id', id)
    loadAll()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Installations</h1>
        <button onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
          {showForm ? 'Cancel' : '+ Assign Software'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold">Assign Software to Computer</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Computer</label>
              <select required value={form.computer_id}
                onChange={e => setForm({ ...form, computer_id: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500">
                <option value="">Select a computer...</option>
                {computers.map(c => (
                  <option key={c.computer_id} value={c.computer_id}>
                    {c.computer_name} ({c.location})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Software License</label>
              <select required value={form.license_id}
                onChange={e => setForm({ ...form, license_id: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500">
                <option value="">Select software...</option>
                {licenses.map(l => (
                  <option key={l.license_id} value={l.license_id}>
                    {l.software_name} ({l.license_type})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Install Date</label>
              <input type="date" value={form.install_date}
                onChange={e => setForm({ ...form, install_date: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <input type="text" value={form.notes}
                onChange={e => setForm({ ...form, notes: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 text-sm font-medium">
            Assign Software
          </button>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" /></div>
      ) : (
        <>
          <p className="text-sm text-gray-500">{installations.length} installation(s)</p>
          {installations.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              No installations yet. Use the &ldquo;Assign Software&rdquo; button to link software to computers.
            </div>
          ) : (
            <>
              {/* Mobile Cards */}
              <div className="grid grid-cols-1 md:hidden gap-3">
                {installations.map(i => (
                  <div key={i.install_id} className="bg-white rounded-lg shadow p-4">
                    <div className="font-semibold text-gray-900">
                      {i.software_licenses?.software_name}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      on {i.computers?.computer_name} ({i.computers?.location})
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Installed: {i.install_date}</div>
                    {i.notes && <div className="text-xs text-gray-500 mt-1">{i.notes}</div>}
                    <button onClick={() => handleDelete(i.install_id)}
                      className="text-red-600 text-xs mt-2 hover:underline">Remove</button>
                  </div>
                ))}
              </div>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full bg-white rounded-lg shadow text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Software</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Computer</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Location</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Install Date</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Notes</th>
                      <th className="py-3 px-4"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {installations.map(i => (
                      <tr key={i.install_id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">{i.software_licenses?.software_name}</td>
                        <td className="py-3 px-4">{i.computers?.computer_name}</td>
                        <td className="py-3 px-4 text-gray-600">{i.computers?.location}</td>
                        <td className="py-3 px-4 text-gray-500">{i.install_date}</td>
                        <td className="py-3 px-4 text-gray-500 max-w-xs truncate">{i.notes ?? '—'}</td>
                        <td className="py-3 px-4">
                          <button onClick={() => handleDelete(i.install_id)}
                            className="text-red-600 hover:underline text-xs">Remove</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
