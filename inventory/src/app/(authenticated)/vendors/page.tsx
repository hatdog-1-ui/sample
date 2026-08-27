"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import DataTable from "@/components/DataTable";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { Database } from "@/lib/database.types";

type Vendor = Database["public"]["Tables"]["vendors"]["Row"];

export default function VendorsPage() {
  const [data, setData] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Vendor | null>(null);
  const [form, setForm] = useState({
    name: "",
    address: "",
    contact_person: "",
    email: "",
    phone: "",
    website: "",
  });

  const fetchData = async () => {
    const { data } = await supabase.from("vendors").select("*").order("name");
    setData(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      address: form.address || null,
      contact_person: form.contact_person || null,
      email: form.email || null,
      phone: form.phone || null,
      website: form.website || null,
    };
    if (editing) {
      await supabase.from("vendors").update(payload as any).eq("id", editing.id); // eslint-disable-line @typescript-eslint/no-explicit-any
    } else {
      await supabase.from("vendors").insert(payload as any); // eslint-disable-line @typescript-eslint/no-explicit-any
    }
    setShowForm(false);
    setEditing(null);
    setForm({ name: "", address: "", contact_person: "", email: "", phone: "", website: "" });
    fetchData();
  };

  const handleEdit = (item: Vendor) => {
    setEditing(item);
    setForm({
      name: item.name,
      address: item.address ?? "",
      contact_person: item.contact_person ?? "",
      email: item.email ?? "",
      phone: item.phone ?? "",
      website: item.website ?? "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this vendor?")) return;
    await supabase.from("vendors").delete().eq("id", id);
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
        <h1 className="text-2xl font-bold text-gray-900">Vendors</h1>
        <button
          onClick={() => {
            setEditing(null);
            setForm({ name: "", address: "", contact_person: "", email: "", phone: "", website: "" });
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          Add Vendor
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">
            {editing ? "Edit Vendor" : "Add Vendor"}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
              <input
                type="text"
                value={form.contact_person}
                onChange={(e) => setForm({ ...form, contact_person: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="text"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
              <input
                type="text"
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <textarea
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                rows={2}
              />
            </div>
            <div className="lg:col-span-3 flex gap-2">
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                {editing ? "Update" : "Add"}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setEditing(null); }}
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
          { key: "name", label: "Name" },
          { key: "contact_person", label: "Contact" },
          { key: "email", label: "Email" },
          { key: "phone", label: "Phone" },
          { key: "website", label: "Website" },
        ]}
        searchKeys={["name", "contact_person", "email"]}
        searchPlaceholder="Search vendors..."
        actions={(item) => (
          <div className="flex gap-2">
            <button
              onClick={() => handleEdit(item as unknown as Vendor)}
              className="p-1 text-gray-400 hover:text-blue-600"
            >
              <Pencil size={16} />
            </button>
            <button
              onClick={() => handleDelete((item as unknown as Vendor).id)}
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
