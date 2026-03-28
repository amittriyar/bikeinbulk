import React from "react";

interface DataTableProps {
  headers: string[];
  children: React.ReactNode;
}

export default function DataTable({ headers, children }: DataTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm bg-white">
      <table className="w-full text-sm text-left">

        {/* Header */}
        <thead className="bg-gray-50 text-gray-700">
          <tr>
            {headers.map((h, i) => (
              <th
                key={i}
                className="px-5 py-3 font-semibold border-b border-gray-200"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>

        {/* Body */}
        <tbody className="text-gray-800">
          {children}
        </tbody>

      </table>
    </div>
  );
}