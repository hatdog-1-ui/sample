"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import DataTable from "@/components/DataTable";
import { LicenseTypeBadge } from "@/components/StatusBadge";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { Database } from "@/lib/database.types";

type Software = Database["public"]["Tables"]["software"]["Row"];

export default function SoftwarePage() {
  const [data, setData] = useState<Software[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Software | null>(null);
  const [form, setForm] = useState({
    name: "",
    license_type: "free" as "paid" | "free",
    download_link: "",
    notes: "",
    responsibility: "lab_assistant" as "lab_assistant" | "it_team" | "no_info",
  });

  const fetchData = async () => {
    const { data } = await supabase
      .from("software")
      .select("*")
      .order("name");
    setData(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      await supabase.from("software").update(form as any).eq("id", editing.id); // eslint-disable-line @typescript-eslint/no-explicit-any
    } else {
      await supabase.from("software").insert(form as any); // eslint-disable-line @typescript-eslint/no-explicit-any
    }
    setShowForm(false);
    setEditing(null);
    setForm({
      name: "",
      license_type: "free",
      download_link: "",
      notes: "",
      responsibility: "lab_assistant",
    });
    fetchData();
  };

  const handleEdit = (item: Software) => {
    setEditing(item);
    setForm({
      name: item.name,
      license_type: item.license_type,
      download_link: item.download_link ?? "",
      notes: item.notes ?? "",
      responsibility: item.responsibility,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this software?")) return;
    await supabase.from("software").delete().eq("id", id);
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
        <h1 className="text-2xl font-bold text-gray-900">Software Catalog</h1>
        <button
          onClick={() => {
            setEditing(null);
            setForm({
              name: "",
              license_type: "free",
              download_link: "",
              notes: "",
              responsibility: "lab_assistant",
            });
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          Add Software
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">
            {editing ? "Edit Software" : "Add Software"}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                License Type
              </label>
              <select
                value={form.license_type}
                onChange={(e) =>
                  setForm({
                    ...form,
                    license_type: e.target.value as "paid" | "free",
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="free">Free</option>
                <option value="paid">Paid</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Download Link
              </label>
              <input
                type="url"
                value={form.download_link}
                onChange={(e) =>
                  setForm({ ...form, download_link: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Responsibility
              </label>
              <select
                value={form.responsibility}
                onChange={(e) =>
                  setForm({
                    ...form,
                    responsibility: e.target.value as
                      | "lab_assistant"
                      | "it_team"
                      | "no_info",
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="lab_assistant">Lab Assistant</option>
                <option value="it_team">IT Team</option>
                <option value="no_info">No Info</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={2}
              />
            </div>
            <div className="md:col-span-2 flex gap-2">
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
          { key: "name", label: "Name" },
          {
            key: "license_type",
            label: "License",
            render: (item) => (
              <LicenseTypeBadge
                type={item.license_type as "paid" | "free"}
              />
            ),
          },
          {
            key: "responsibility",
            label: "Responsibility",
            render: (item) => {
              const r = item.responsibility as string;
              return (
                <span className="capitalize">
                  {r === "lab_assistant"
                    ? "Lab Assistant"
                    : r === "it_team"
                      ? "IT Team"
                      : "No Info"}
                </span>
              );
            },
          },
          { key: "notes", label: "Notes" },
        ]}
        searchKeys={["name", "notes"]}
        searchPlaceholder="Search software..."
        actions={(item) => (
          <div className="flex gap-2">
            <button
              onClick={() => handleEdit(item as unknown as Software)}
              className="p-1 text-gray-400 hover:text-blue-600"
            >
              <Pencil size={16} />
            </button>
            <button
              onClick={() =>
                handleDelete((item as unknown as Software).id)
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
