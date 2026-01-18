"use client";

import { useState } from "react";
import { createAttribute, updateAttribute, deleteAttribute } from "./actions";

interface Attribute {
  id: string;
  name: string;
  slug: string;
  category: string;
  icon: string | null;
  created_at: string;
}

interface AttributesManagerProps {
  groupedAttributes: Record<string, Attribute[]>;
  categoryLabels: Record<string, string>;
  categoryOrder: string[];
}

export function AttributesManager({
  groupedAttributes,
  categoryLabels,
  categoryOrder,
}: AttributesManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "equipment",
    icon: "",
  });

  const handleAdd = async () => {
    if (!formData.name.trim()) return;

    setLoading(true);
    await createAttribute(formData.name, formData.category, formData.icon || undefined);
    setFormData({ name: "", category: "equipment", icon: "" });
    setIsAdding(false);
    setLoading(false);
  };

  const handleUpdate = async (id: string) => {
    if (!formData.name.trim()) return;

    setLoading(true);
    await updateAttribute(id, formData.name, formData.category, formData.icon || undefined);
    setEditingId(null);
    setLoading(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    setLoading(true);
    await deleteAttribute(id);
    setLoading(false);
  };

  const startEdit = (attr: Attribute) => {
    setEditingId(attr.id);
    setFormData({
      name: attr.name,
      category: attr.category,
      icon: attr.icon || "",
    });
  };

  return (
    <div className="mt-6">
      {/* Add button */}
      {!isAdding && (
        <button
          onClick={() => setIsAdding(true)}
          className="mb-6 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800:bg-zinc-100"
        >
          Add Attribute
        </button>
      )}

      {/* Add form */}
      {isAdding && (
        <div className="mb-6 rounded-xl border border-zinc-200 bg-white p-4">
          <h3 className="mb-4 font-semibold text-zinc-900">
            New Attribute
          </h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <input
              type="text"
              placeholder="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="rounded-lg border border-zinc-200 px-3 py-2 text-sm"
            />
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="rounded-lg border border-zinc-200 px-3 py-2 text-sm"
            >
              {categoryOrder.map((cat) => (
                <option key={cat} value={cat}>
                  {categoryLabels[cat]}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Icon (optional)"
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              className="rounded-lg border border-zinc-200 px-3 py-2 text-sm"
            />
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={handleAdd}
              disabled={loading}
              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? "Adding..." : "Add"}
            </button>
            <button
              onClick={() => {
                setIsAdding(false);
                setFormData({ name: "", category: "equipment", icon: "" });
              }}
              className="rounded-lg border border-zinc-200 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50:bg-zinc-800"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Categories */}
      <div className="space-y-8">
        {categoryOrder.map((category) => {
          const attrs = groupedAttributes[category] || [];
          if (attrs.length === 0 && !isAdding) return null;

          return (
            <div key={category}>
              <h2 className="mb-4 text-lg font-semibold text-zinc-900">
                {categoryLabels[category]}
                <span className="ml-2 text-sm font-normal text-zinc-500">
                  ({attrs.length})
                </span>
              </h2>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {attrs.map((attr) => (
                  <div
                    key={attr.id}
                    className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white p-3"
                  >
                    {editingId === attr.id ? (
                      <div className="flex flex-1 items-center gap-2">
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          className="flex-1 rounded border border-zinc-200 px-2 py-1 text-sm"
                        />
                        <button
                          onClick={() => handleUpdate(attr.id)}
                          disabled={loading}
                          className="text-sm text-green-600 hover:text-green-700"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="text-sm text-zinc-600 hover:text-zinc-900"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                          {attr.icon && (
                            <span className="text-lg">{attr.icon}</span>
                          )}
                          <span className="text-sm text-zinc-900">
                            {attr.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => startEdit(attr)}
                            className="text-sm text-zinc-600 hover:text-zinc-900:text-white"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(attr.id, attr.name)}
                            className="text-sm text-red-600 hover:text-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
