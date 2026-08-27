"use client";

import { useState } from "react";
import { Search, ChevronUp, ChevronDown } from "lucide-react";

interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchKeys?: string[];
  searchPlaceholder?: string;
  actions?: (item: T) => React.ReactNode;
}

export default function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  searchKeys = [],
  searchPlaceholder = "Search...",
  actions,
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const filtered = data.filter((item) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return searchKeys.some((key) =>
      String(item[key] ?? "")
        .toLowerCase()
        .includes(q)
    );
  });

  const sorted = sortKey
    ? [...filtered].sort((a, b) => {
        const aVal = String(a[sortKey] ?? "");
        const bVal = String(b[sortKey] ?? "");
        const cmp = aVal.localeCompare(bVal);
        return sortDir === "asc" ? cmp : -cmp;
      })
    : filtered;

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  return (
    <div>
      {searchKeys.length > 0 && (
        <div className="mb-4 relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      )}

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-left font-semibold text-gray-600 ${
                    col.sortable !== false ? "cursor-pointer select-none" : ""
                  }`}
                  onClick={() =>
                    col.sortable !== false && handleSort(col.key)
                  }
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {sortKey === col.key &&
                      (sortDir === "asc" ? (
                        <ChevronUp size={14} />
                      ) : (
                        <ChevronDown size={14} />
                      ))}
                  </div>
                </th>
              ))}
              {actions && (
                <th className="px-4 py-3 text-left font-semibold text-gray-600">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (actions ? 1 : 0)}
                  className="px-4 py-8 text-center text-gray-500"
                >
                  No data found
                </td>
              </tr>
            ) : (
              sorted.map((item, idx) => (
                <tr
                  key={idx}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-gray-700">
                      {col.render
                        ? col.render(item)
                        : String(item[col.key] ?? "-")}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-4 py-3">{actions(item)}</td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-2 text-sm text-gray-500">
        {sorted.length} of {data.length} items
      </p>
    </div>
  );
}
