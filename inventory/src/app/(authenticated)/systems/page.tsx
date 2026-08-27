"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import DataTable from "@/components/DataTable";
import { Plus, Pencil, Trash2 } from "lucide-react";

interface LabSystem {
  id: number;
  lab_id: number;
  system_name: string;
  hardware_specs: string | null;
  labs: { name: string } | null;
}

interface LabOption {
  id: number;
  name: string;
}

export default function SystemsPage() {
  const [data, setData] = useState<LabSystem[]>([]);
  const [labs, setLabs] = useState<LabOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<LabSystem | null>(null);
  const [form, setForm] = useState({
    lab_id: 0,
    system_name: "",
    hardware_specs: "",
  });

  const fetchData = async () => {
    const [sysRes, labRes] = await Promise.all([
      supabase
        .from("lab_systems")
        .select("*, labs:lab_id(name)")
        .order("system_name"),
      supabase.from("labs").select("id, name").order("name"),
    ]);
    setData((sysRes.data as unknown as LabSystem[]) ?? []);
    setLabs(labRes.data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      lab_id: form.lab_id,
      system_name: form.system_name,
      hardware_specs: form.hardware_specs || null,
    };
    if (editing) {
      await supabase.from("lab_systems").update(payload as any).eq("id", editing.id); // eslint-disable-line @typescript-eslint/no-explicit-any
    } else {
      await supabase.from("lab_systems").insert(payload as any); // eslint-disable-line @typescript-eslint/no-explicit-any
    }
    setShowForm(false);
    setEditing(null);
    fetchData();
  };

  const handleEdit = (item: LabSystem) => {
    setEditing(item);
    setForm({
      lab_id: item.lab_id,
      system_name: item.system_name,
      hardware_specs: item.hardware_specs ?? "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this system?")) return;
    await supabase.from("lab_systems").delete().eq("id", id);
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
        <h1 className="text-2xl font-bold text-gray-900">Lab Systems</h1>
        <button
          onClick={() => {
            setEditing(null);
            setForm({ lab_id: labs[0]?.id ?? 0, system_name: "", hardware_specs: "" });
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          Add System
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">
            {editing ? "Edit System" : "Add System"}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lab *</label>
              <select
                value={form.lab_id}
                onChange={(e) => setForm({ ...form, lab_id: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                required
              >
                <option value={0} disabled>Select lab</option>
                {labs.map((l) => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">System Name *</label>
              <input
                type="text"
                value={form.system_name}
                onChange={(e) => setForm({ ...form, system_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="e.g. LAB204COMP-01"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hardware Specs</label>
              <input
                type="text"
                value={form.hardware_specs}
                onChange={(e) => setForm({ ...form, hardware_specs: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="md:col-span-3 flex gap-2">
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
          {
            key: "labs",
            label: "Lab",
            render: (item) => {
              const lab = (item as unknown as LabSystem).labs;
              return lab?.name ?? "-";
            },
          },
          { key: "system_name", label: "System Name" },
          { key: "hardware_specs", label: "Hardware Specs" },
        ]}
        searchKeys={["system_name", "hardware_specs"]}
        searchPlaceholder="Search systems..."
        actions={(item) => (
          <div className="flex gap-2">
            <button
              onClick={() => handleEdit(item as unknown as LabSystem)}
              className="p-1 text-gray-400 hover:text-blue-600"
            >
              <Pencil size={16} />
            </button>
            <button
              onClick={() => handleDelete((item as unknown as LabSystem).id)}
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
