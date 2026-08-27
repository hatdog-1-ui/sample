"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import DataTable from "@/components/DataTable";
import StatusBadge from "@/components/StatusBadge";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { format, parseISO } from "date-fns";

interface License {
  id: number;
  software_id: number;
  vendor_id: number | null;
  lab_names: string;
  num_licenses: string | null;
  expiration_date: string | null;
  renewal_date: string | null;
  login_details: string | null;
  client_pc_login: string | null;
  rfq_date: string | null;
  mr_date: string | null;
  notes: string | null;
  software: { name: string } | null;
  vendors: { name: string } | null;
}

interface SoftwareOption {
  id: number;
  name: string;
}

interface VendorOption {
  id: number;
  name: string;
}

export default function LicensesPage() {
  const [data, setData] = useState<License[]>([]);
  const [softwareList, setSoftwareList] = useState<SoftwareOption[]>([]);
  const [vendorList, setVendorList] = useState<VendorOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<License | null>(null);
  const [form, setForm] = useState({
    software_id: 0,
    vendor_id: null as number | null,
    lab_names: "",
    num_licenses: "",
    expiration_date: "",
    renewal_date: "",
    login_details: "",
    client_pc_login: "",
    rfq_date: "",
    mr_date: "",
    notes: "",
  });

  const fetchData = async () => {
    const [licRes, swRes, vRes] = await Promise.all([
      supabase
        .from("licenses")
        .select("*, software:software_id(name), vendors:vendor_id(name)")
        .order("expiration_date", { ascending: true }),
      supabase
        .from("software")
        .select("id, name")
        .eq("license_type", "paid")
        .order("name"),
      supabase.from("vendors").select("id, name").order("name"),
    ]);
    setData((licRes.data as unknown as License[]) ?? []);
    setSoftwareList(swRes.data ?? []);
    setVendorList(vRes.data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      vendor_id: form.vendor_id || null,
      expiration_date: form.expiration_date || null,
      renewal_date: form.renewal_date || null,
      login_details: form.login_details || null,
      client_pc_login: form.client_pc_login || null,
      rfq_date: form.rfq_date || null,
      mr_date: form.mr_date || null,
      notes: form.notes || null,
      num_licenses: form.num_licenses || null,
    };
    if (editing) {
      await supabase.from("licenses").update(payload as any).eq("id", editing.id); // eslint-disable-line @typescript-eslint/no-explicit-any
    } else {
      await supabase.from("licenses").insert(payload as any); // eslint-disable-line @typescript-eslint/no-explicit-any
    }
    setShowForm(false);
    setEditing(null);
    fetchData();
  };

  const handleEdit = (item: License) => {
    setEditing(item);
    setForm({
      software_id: item.software_id,
      vendor_id: item.vendor_id,
      lab_names: item.lab_names,
      num_licenses: item.num_licenses ?? "",
      expiration_date: item.expiration_date ?? "",
      renewal_date: item.renewal_date ?? "",
      login_details: item.login_details ?? "",
      client_pc_login: item.client_pc_login ?? "",
      rfq_date: item.rfq_date ?? "",
      mr_date: item.mr_date ?? "",
      notes: item.notes ?? "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this license record?")) return;
    await supabase.from("licenses").delete().eq("id", id);
    fetchData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">License Tracking</h1>
        <button
          onClick={() => {
            setEditing(null);
            setForm({
              software_id: softwareList[0]?.id ?? 0,
              vendor_id: null,
              lab_names: "",
              num_licenses: "",
              expiration_date: "",
              renewal_date: "",
              login_details: "",
              client_pc_login: "",
              rfq_date: "",
              mr_date: "",
              notes: "",
            });
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          Add License
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">
            {editing ? "Edit License" : "Add License"}
          </h2>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Software *
              </label>
              <select
                value={form.software_id}
                onChange={(e) =>
                  setForm({ ...form, software_id: Number(e.target.value) })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                required
              >
                <option value={0} disabled>
                  Select software
                </option>
                {softwareList.map((sw) => (
                  <option key={sw.id} value={sw.id}>
                    {sw.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vendor
              </label>
              <select
                value={form.vendor_id ?? ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    vendor_id: e.target.value ? Number(e.target.value) : null,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">None</option>
                {vendorList.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lab(s) *
              </label>
              <input
                type="text"
                value={form.lab_names}
                onChange={(e) =>
                  setForm({ ...form, lab_names: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="e.g. 107, 327"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                No. of Licenses
              </label>
              <input
                type="text"
                value={form.num_licenses}
                onChange={(e) =>
                  setForm({ ...form, num_licenses: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expiration Date
              </label>
              <input
                type="date"
                value={form.expiration_date}
                onChange={(e) =>
                  setForm({ ...form, expiration_date: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Renewal Date
              </label>
              <input
                type="date"
                value={form.renewal_date}
                onChange={(e) =>
                  setForm({ ...form, renewal_date: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Login Details
              </label>
              <textarea
                value={form.login_details}
                onChange={(e) =>
                  setForm({ ...form, login_details: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                rows={2}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client PC Login
              </label>
              <textarea
                value={form.client_pc_login}
                onChange={(e) =>
                  setForm({ ...form, client_pc_login: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                rows={2}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                rows={2}
              />
            </div>
            <div className="lg:col-span-3 flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {editing ? "Update" : "Add"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditing(null);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <DataTable
        data={data as unknown as Record<string, unknown>[]}
        columns={[
          {
            key: "software",
            label: "Software",
            render: (item) => {
              const sw = (item as unknown as License).software;
              return <span className="font-medium">{sw?.name ?? "-"}</span>;
            },
          },
          { key: "lab_names", label: "Lab(s)" },
          { key: "num_licenses", label: "Licenses" },
          {
            key: "expiration_date",
            label: "Expiration",
            render: (item) => {
              const d = item.expiration_date as string | null;
              if (!d) return "-";
              return (
                <div className="flex items-center gap-2">
                  <span>{format(parseISO(d), "MMM d, yyyy")}</span>
                  <StatusBadge date={d} />
                </div>
              );
            },
          },
          {
            key: "vendors",
            label: "Vendor",
            render: (item) => {
              const v = (item as unknown as License).vendors;
              return v?.name ?? "-";
            },
          },
        ]}
        searchKeys={["lab_names", "num_licenses", "notes"]}
        searchPlaceholder="Search licenses..."
        actions={(item) => (
          <div className="flex gap-2">
            <button
              onClick={() => handleEdit(item as unknown as License)}
              className="p-1 text-gray-400 hover:text-blue-600"
            >
              <Pencil size={16} />
            </button>
            <button
              onClick={() =>
                handleDelete((item as unknown as License).id)
              }
              className="p-1 text-gray-400 hover:text-red-600"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
      />
    </div>
  );
}
