"use client";

import { useState } from "react";
import { updateUserRole } from "./actions";

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  created_at: string;
}

interface UsersTableProps {
  users: User[];
}

export function UsersTable({ users }: UsersTableProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleRoleChange = async (id: string, newRole: string) => {
    if (!confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
      return;
    }
    setLoadingId(id);
    await updateUserRole(id, newRole);
    setLoadingId(null);
  };

  if (users.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-12 text-center">
        <p className="text-zinc-500">No users found</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
      <table className="w-full">
        <thead className="border-b border-zinc-200 bg-zinc-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
              User
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
              Role
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
              Joined
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-500">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200">
          {users.map((user) => (
            <tr
              key={user.id}
              className={loadingId === user.id ? "opacity-50" : ""}
            >
              <td className="px-4 py-3">
                <div>
                  <p className="font-medium text-zinc-900">
                    {user.name || "No name"}
                  </p>
                  <p className="text-sm text-zinc-500">
                    {user.email}
                  </p>
                </div>
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                    user.role === "admin"
                      ? "bg-purple-100 text-purple-700"
                      : user.role === "owner"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-zinc-100 text-zinc-600"
                  }`}
                >
                  {user.role}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-zinc-600">
                {new Date(user.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </td>
              <td className="px-4 py-3 text-right">
                <select
                  value={user.role}
                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  disabled={loadingId === user.id}
                  className="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-sm"
                >
                  <option value="user">User</option>
                  <option value="owner">Owner</option>
                  <option value="admin">Admin</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
