"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Package, Key, Monitor, AlertTriangle, Building2 } from "lucide-react";
import { differenceInDays, parseISO, format } from "date-fns";

interface Stats {
  totalSoftware: number;
  paidSoftware: number;
  freeSoftware: number;
  totalLabs: number;
  totalVendors: number;
  expiringLicenses: ExpiringLicense[];
}

interface ExpiringLicense {
  id: number;
  softwareName: string;
  labNames: string;
  expirationDate: string;
  daysLeft: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      const [softwareRes, labsRes, vendorsRes, licensesRes] = await Promise.all(
        [
          supabase.from("software").select("id, license_type"),
          supabase.from("labs").select("id"),
          supabase.from("vendors").select("id"),
          supabase
            .from("licenses")
            .select("id, expiration_date, lab_names, software:software_id(name)")
            .not("expiration_date", "is", null)
            .order("expiration_date", { ascending: true }),
        ]
      );

      /* eslint-disable @typescript-eslint/no-explicit-any */
      const software = (softwareRes.data ?? []) as any[];
      const labs = (labsRes.data ?? []) as any[];
      const vendors = (vendorsRes.data ?? []) as any[];
      const licenses = (licensesRes.data ?? []) as any[];

      const now = new Date();
      const expiring: ExpiringLicense[] = licenses
        .filter((l) => {
          if (!l.expiration_date) return false;
          const days = differenceInDays(parseISO(l.expiration_date), now);
          return days >= -30 && days <= 90;
        })
        .map((l) => {
          const days = differenceInDays(parseISO(l.expiration_date!), now);
          const sw = l.software as unknown as { name: string } | null;
          return {
            id: l.id,
            softwareName: sw?.name ?? "Unknown",
            labNames: l.lab_names,
            expirationDate: l.expiration_date!,
            daysLeft: days,
          };
        })
        .sort((a, b) => a.daysLeft - b.daysLeft);

      setStats({
        totalSoftware: software.length,
        paidSoftware: software.filter((s) => s.license_type === "paid").length,
        freeSoftware: software.filter((s) => s.license_type === "free").length,
        totalLabs: labs.length,
        totalVendors: vendors.length,
        expiringLicenses: expiring,
      });
      setLoading(false);
    }

    fetchStats();

    const channel = supabase
      .channel("dashboard-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "licenses" },
        () => fetchStats()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "software" },
        () => fetchStats()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    {
      label: "Total Software",
      value: stats.totalSoftware,
      icon: Package,
      color: "bg-blue-500",
    },
    {
      label: "Paid Licenses",
      value: stats.paidSoftware,
      icon: Key,
      color: "bg-purple-500",
    },
    {
      label: "Free Software",
      value: stats.freeSoftware,
      icon: Package,
      color: "bg-green-500",
    },
    {
      label: "Labs",
      value: stats.totalLabs,
      icon: Monitor,
      color: "bg-orange-500",
    },
    {
      label: "Vendors",
      value: stats.totalVendors,
      icon: Building2,
      color: "bg-teal-500",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-xl shadow-sm p-5 border border-gray-100"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-500">
                {card.label}
              </span>
              <div className={`${card.color} p-2 rounded-lg`}>
                <card.icon size={16} className="text-white" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle size={20} className="text-orange-500" />
          <h2 className="text-lg font-semibold text-gray-900">
            License Alerts
          </h2>
        </div>

        {stats.expiringLicenses.length === 0 ? (
          <p className="text-gray-500 text-sm">
            No licenses expiring within 90 days.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 font-semibold text-gray-600">
                    Software
                  </th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-600">
                    Lab(s)
                  </th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-600">
                    Expiration
                  </th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-600">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {stats.expiringLicenses.map((lic) => (
                  <tr
                    key={lic.id}
                    className="border-b border-gray-50 hover:bg-gray-50"
                  >
                    <td className="py-2 px-3 font-medium text-gray-900">
                      {lic.softwareName}
                    </td>
                    <td className="py-2 px-3 text-gray-600">{lic.labNames}</td>
                    <td className="py-2 px-3 text-gray-600">
                      {format(parseISO(lic.expirationDate), "MMM d, yyyy")}
                    </td>
                    <td className="py-2 px-3">
                      <span
                        className={`px-2 py-1 text-xs rounded-full font-medium ${
                          lic.daysLeft < 0
                            ? "bg-red-100 text-red-700"
                            : lic.daysLeft <= 30
                              ? "bg-orange-100 text-orange-700"
                              : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {lic.daysLeft < 0
                          ? `Expired ${Math.abs(lic.daysLeft)}d ago`
                          : `${lic.daysLeft}d left`}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
