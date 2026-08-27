"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import DataTable from "@/components/DataTable";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { Database } from "@/lib/database.types";

type Lab = Database["public"]["Tables"]["labs"]["Row"];

export default function LabsPage() {
  const [data, setData] = useState<Lab[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Lab | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    hardware_specs: "",
  });

  const fetchData = async () => {
    const { data } = await supabase.from("labs").select("*").order("name");
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
      description: form.description || null,
      hardware_specs: form.hardware_specs || null,
    };
    if (editing) {
      await supabase.from("labs").update(payload as any).eq("id", editing.id); // eslint-disable-line @typescript-eslint/no-explicit-any
    } else {
      await supabase.from("labs").insert(payload as any); // eslint-disable-line @typescript-eslint/no-explicit-any
    }
    setShowForm(false);
    setEditing(null);
    setForm({ name: "", description: "", hardware_specs: "" });
    fetchData();
  };

  const handleEdit = (item: Lab) => {
    setEditing(item);
    setForm({
      name: item.name,
      description: item.description ?? "",
      hardware_specs: item.hardware_specs ?? "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this lab?")) return;
    await supabase.from("labs").delete().eq("id", id);
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
        <h1 className="text-2xl font-bold text-gray-900">Labs</h1>
        <button
          onClick={() => {
            setEditing(null);
            setForm({ name: "", description: "", hardware_specs: "" });
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          Add Lab
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">
            {editing ? "Edit Lab" : "Add Lab"}
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
                Description
              </label>
              <input
                type="text"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hardware Specs
              </label>
              <textarea
                value={form.hardware_specs}
                onChange={(e) =>
                  setForm({ ...form, hardware_specs: e.target.value })
                }
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
          { key: "name", label: "Lab Name" },
          { key: "description", label: "Description" },
          {
            key: "hardware_specs",
            label: "Hardware Specs",
            render: (item) => (
              <span className="text-xs text-gray-500 whitespace-pre-wrap">
                {(item.hardware_specs as string) ?? "-"}
              </span>
            ),
          },
        ]}
        searchKeys={["name", "description", "hardware_specs"]}
        searchPlaceholder="Search labs..."
        actions={(item) => (
          <div className="flex gap-2">
            <button
              onClick={() => handleEdit(item as unknown as Lab)}
              className="p-1 text-gray-400 hover:text-blue-600"
            >
              <Pencil size={16} />
            </button>
            <button
              onClick={() => handleDelete((item as unknown as Lab).id)}
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
