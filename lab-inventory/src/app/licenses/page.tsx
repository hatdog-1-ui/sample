'use client'

import { useEffect, useState } from 'react'
import { supabase, SoftwareLicense, LicenseSeatUsage } from '@/lib/supabase'

export default function LicensesPage() {
  const [licenses, setLicenses] = useState<LicenseSeatUsage[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [filterType, setFilterType] = useState('')
  const [form, setForm] = useState({
    software_name: '', license_type: 'Paid', total_seats: '',
    expiration_date: '', vendor: '', contact_details: '', notes: '',
  })

  async function loadLicenses() {
    let query = supabase.from('license_seat_usage').select('*').order('software_name')
    if (filterType) query = query.eq('license_type', filterType)
    const { data } = await query
    if (data) setLicenses(data)
    setLoading(false)
  }

  useEffect(() => { loadLicenses() }, [filterType])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const { error } = await supabase.from('software_licenses').insert({
      software_name: form.software_name,
      license_type: form.license_type,
      total_seats: form.total_seats ? parseInt(form.total_seats) : null,
      expiration_date: form.expiration_date || null,
      vendor: form.vendor || null,
      contact_details: form.contact_details || null,
      notes: form.notes || null,
    })
    if (error) { alert(error.message); return }
    setForm({ software_name: '', license_type: 'Paid', total_seats: '', expiration_date: '', vendor: '', contact_details: '', notes: '' })
    setShowForm(false)
    loadLicenses()
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this license? This will also remove its installations.')) return
    await supabase.from('software_licenses').delete().eq('license_id', id)
    loadLicenses()
  }

  function getExpiryStatus(date: string | null): string {
    if (!date) return ''
    const days = (new Date(date).getTime() - Date.now()) / 86400000
    if (days < 0) return 'expired'
    if (days <= 90) return 'expiring'
    return 'ok'
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Software Licenses</h1>
        <button onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
          {showForm ? 'Cancel' : '+ Add License'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold">Add New Software License</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Software Name</label>
              <input type="text" required value={form.software_name}
                onChange={e => setForm({ ...form, software_name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">License Type</label>
              <select value={form.license_type} onChange={e => setForm({ ...form, license_type: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                <option>Paid</option><option>Free</option><option>Trial</option><option>Educational</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Seats</label>
              <input type="number" min="0" value={form.total_seats}
                onChange={e => setForm({ ...form, total_seats: e.target.value })}
                placeholder="Leave blank if unlimited"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expiration Date</label>
              <input type="date" value={form.expiration_date}
                onChange={e => setForm({ ...form, expiration_date: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
              <input type="text" value={form.vendor}
                onChange={e => setForm({ ...form, vendor: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Details</label>
              <input type="text" value={form.contact_details}
                onChange={e => setForm({ ...form, contact_details: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <input type="text" value={form.notes}
                onChange={e => setForm({ ...form, notes: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 text-sm font-medium">
            Save License
          </button>
        </form>
      )}

      <div className="flex gap-3">
        <select value={filterType} onChange={e => setFilterType(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white">
          <option value="">All Types</option>
          <option>Paid</option><option>Free</option><option>Trial</option><option>Educational</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" /></div>
      ) : (
        <>
          <p className="text-sm text-gray-500">{licenses.length} license(s)</p>
          {/* Mobile Cards */}
          <div className="grid grid-cols-1 md:hidden gap-3">
            {licenses.map(l => {
              const status = getExpiryStatus(l.expiration_date)
              return (
                <div key={l.license_id} className="bg-white rounded-lg shadow p-4">
                  <div className="flex justify-between items-start">
                    <div className="font-semibold text-gray-900">{l.software_name}</div>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                      l.license_type === 'Free' ? 'bg-green-100 text-green-800' :
                      l.license_type === 'Paid' ? 'bg-blue-100 text-blue-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>{l.license_type}</span>
                  </div>
                  {l.total_seats != null && (
                    <div className="mt-2 text-sm">
                      <span className="text-gray-600">Seats: </span>
                      <span className="font-medium">{l.used_seats}/{l.total_seats}</span>
                      <span className={`ml-2 ${l.remaining_seats != null && l.remaining_seats <= 3 ? 'text-red-600' : 'text-green-600'}`}>
                        ({l.remaining_seats} remaining)
                      </span>
                    </div>
                  )}
                  {l.expiration_date && (
                    <div className={`mt-1 text-sm ${status === 'expired' ? 'text-red-600 font-medium' : status === 'expiring' ? 'text-yellow-600' : 'text-gray-500'}`}>
                      {status === 'expired' ? 'Expired: ' : 'Expires: '}{l.expiration_date}
                    </div>
                  )}
                  {l.vendor && <div className="text-xs text-gray-500 mt-1">{l.vendor}</div>}
                  <button onClick={() => handleDelete(l.license_id)}
                    className="text-red-600 text-xs mt-2 hover:underline">Delete</button>
                </div>
              )
            })}
          </div>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg shadow text-sm">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Software</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Type</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600">Total</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600">Used</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600">Remaining</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Expiry</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Vendor</th>
                  <th className="py-3 px-4"></th>
                </tr>
              </thead>
              <tbody>
                {licenses.map(l => {
                  const status = getExpiryStatus(l.expiration_date)
                  return (
                    <tr key={l.license_id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{l.software_name}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                          l.license_type === 'Free' ? 'bg-green-100 text-green-800' :
                          l.license_type === 'Paid' ? 'bg-blue-100 text-blue-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>{l.license_type}</span>
                      </td>
                      <td className="py-3 px-4 text-center">{l.total_seats ?? '—'}</td>
                      <td className="py-3 px-4 text-center">{l.used_seats}</td>
                      <td className="py-3 px-4 text-center">
                        {l.remaining_seats != null ? (
                          <span className={l.remaining_seats <= 3 ? 'text-red-600 font-semibold' : 'text-green-600'}>
                            {l.remaining_seats}
                          </span>
                        ) : '—'}
                      </td>
                      <td className={`py-3 px-4 ${status === 'expired' ? 'text-red-600 font-medium' : status === 'expiring' ? 'text-yellow-600' : 'text-gray-500'}`}>
                        {l.expiration_date ?? '—'}
                      </td>
                      <td className="py-3 px-4 text-gray-500 max-w-xs truncate">{l.vendor ?? '—'}</td>
                      <td className="py-3 px-4">
                        <button onClick={() => handleDelete(l.license_id)}
                          className="text-red-600 hover:underline text-xs">Delete</button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
