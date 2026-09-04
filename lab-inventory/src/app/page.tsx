'use client'

import { useEffect, useState } from 'react'
import { supabase, Computer, LicenseSeatUsage } from '@/lib/supabase'
import Link from 'next/link'

export default function Dashboard() {
  const [computers, setComputers] = useState<Computer[]>([])
  const [licenses, setLicenses] = useState<LicenseSeatUsage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [compRes, licRes] = await Promise.all([
        supabase.from('computers').select('*').order('location'),
        supabase.from('license_seat_usage').select('*').order('software_name'),
      ])
      if (compRes.data) setComputers(compRes.data)
      if (licRes.data) setLicenses(licRes.data)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" /></div>
  }

  const activeCount = computers.filter(c => c.status === 'Active').length
  const locationGroups = computers.reduce<Record<string, number>>((acc, c) => {
    acc[c.location] = (acc[c.location] || 0) + 1
    return acc
  }, {})
  const paidLicenses = licenses.filter(l => l.license_type !== 'Free')
  const expiringSoon = paidLicenses.filter(l => {
    if (!l.expiration_date) return false
    const days = (new Date(l.expiration_date).getTime() - Date.now()) / 86400000
    return days <= 90 && days > 0
  })
  const expired = paidLicenses.filter(l => {
    if (!l.expiration_date) return false
    return new Date(l.expiration_date) < new Date()
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Computers" value={computers.length} color="blue" />
        <StatCard label="Active" value={activeCount} color="green" />
        <StatCard label="Paid Licenses" value={paidLicenses.length} color="purple" />
        <StatCard label="Expiring Soon" value={expiringSoon.length} color={expiringSoon.length > 0 ? 'yellow' : 'green'} />
      </div>

      {/* Expired Licenses Alert */}
      {expired.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-semibold mb-2">Expired Licenses ({expired.length})</h3>
          <ul className="space-y-1">
            {expired.map(l => (
              <li key={l.license_id} className="text-red-700 text-sm">
                {l.software_name} — expired {l.expiration_date}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Expiring Soon */}
      {expiringSoon.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-yellow-800 font-semibold mb-2">Expiring Within 90 Days</h3>
          <ul className="space-y-1">
            {expiringSoon.map(l => (
              <li key={l.license_id} className="text-yellow-700 text-sm">
                {l.software_name} — expires {l.expiration_date}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Computers by Location */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Computers by Location</h2>
          <Link href="/computers" className="text-blue-600 hover:underline text-sm">View all</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Object.entries(locationGroups).sort().map(([loc, count]) => (
            <div key={loc} className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-gray-900">{count}</div>
              <div className="text-sm text-gray-600">{loc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* License Seat Usage */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Paid License Seat Usage</h2>
          <Link href="/licenses" className="text-blue-600 hover:underline text-sm">View all</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 pr-4 font-medium text-gray-600">Software</th>
                <th className="text-center py-2 px-2 font-medium text-gray-600">Total</th>
                <th className="text-center py-2 px-2 font-medium text-gray-600">Used</th>
                <th className="text-center py-2 px-2 font-medium text-gray-600">Remaining</th>
                <th className="text-left py-2 pl-2 font-medium text-gray-600">Expiry</th>
              </tr>
            </thead>
            <tbody>
              {paidLicenses.map(l => (
                <tr key={l.license_id} className="border-b border-gray-100">
                  <td className="py-2 pr-4 font-medium">{l.software_name}</td>
                  <td className="py-2 px-2 text-center">{l.total_seats ?? '—'}</td>
                  <td className="py-2 px-2 text-center">{l.used_seats}</td>
                  <td className="py-2 px-2 text-center">
                    {l.remaining_seats != null ? (
                      <span className={l.remaining_seats <= 3 ? 'text-red-600 font-semibold' : 'text-green-600'}>
                        {l.remaining_seats}
                      </span>
                    ) : '—'}
                  </td>
                  <td className="py-2 pl-2 text-gray-500">{l.expiration_date ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 border-blue-200 text-blue-800',
    green: 'bg-green-50 border-green-200 text-green-800',
    purple: 'bg-purple-50 border-purple-200 text-purple-800',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    red: 'bg-red-50 border-red-200 text-red-800',
  }
  return (
    <div className={`rounded-lg border p-4 ${colors[color]}`}>
      <div className="text-3xl font-bold">{value}</div>
      <div className="text-sm mt-1">{label}</div>
    </div>
  )
}
