"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import DataTable from "@/components/DataTable";
import { ExternalLink } from "lucide-react";

interface FreeSoftware {
  id: number;
  name: string;
  download_link: string | null;
  notes: string | null;
}

export default function FreeSoftwarePage() {
  const [data, setData] = useState<FreeSoftware[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const { data } = await supabase
        .from("software")
        .select("id, name, download_link, notes")
        .eq("license_type", "free")
        .order("name");
      setData(data ?? []);
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Free Software Catalog
      </h1>

      <DataTable
        data={data as unknown as Record<string, unknown>[]}
        columns={[
          { key: "name", label: "Software Name" },
          {
            key: "download_link",
            label: "Download",
            render: (item) => {
              const link = item.download_link as string | null;
              if (!link) return "-";
              return (
                <a
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline inline-flex items-center gap-1"
                >
                  Link <ExternalLink size={12} />
                </a>
              );
            },
          },
          { key: "notes", label: "Notes" },
        ]}
        searchKeys={["name", "notes"]}
        searchPlaceholder="Search free software..."
      />
    </div>
  );
}
