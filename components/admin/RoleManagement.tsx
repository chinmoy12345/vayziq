"use client";
import { useEffect, useMemo, useState } from "react";

type Permission = { id: number; module: string; action: string; name: string | null; description?: string | null };
type Role = { id: number; name: string; slug: string; description: string | null; permissionIds: number[]; assignedUsers: number };
type StaffUser = { id: number; name: string; email: string; status: string; roleIds: number[]; isSuperAdmin: boolean };
type RoleDraft = { name: string; slug: string; description: string; permissionIds: number[] };
type Data = { permissions: Permission[]; roles: Role[]; users: StaffUser[] };
const blank = (): RoleDraft => ({ name: "", slug: "", description: "", permissionIds: [] });
const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export default function RoleManagement() {
  const [data, setData] = useState<Data>({ permissions: [], roles: [], users: [] });
  const [draft, setDraft] = useState<RoleDraft>(blank());
  const [roleId, setRoleId] = useState<number | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [roleIds, setRoleIds] = useState<number[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadData() {
    try {
      const response = await fetch("/api/admin/roles", { cache: "no-store" });
      const payload = await response.json() as Data & { success?: boolean; message?: string };
      if (!response.ok || !payload.success) throw new Error(payload.message || "RBAC settings could not be loaded.");
      setData({ permissions: payload.permissions, roles: payload.roles, users: payload.users });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "RBAC settings could not be loaded.");
    } finally { setLoading(false); }
  }
  useEffect(() => {
    let active = true;
    void fetch("/api/admin/roles", { cache: "no-store" })
      .then(async response => {
        const payload = await response.json() as Data & { success?: boolean; message?: string };
        if (!response.ok || !payload.success) throw new Error(payload.message || "RBAC settings could not be loaded.");
        return { permissions: payload.permissions, roles: payload.roles, users: payload.users };
      })
      .then(value => { if (active) setData(value); })
      .catch(reason => { if (active) setError(reason instanceof Error ? reason.message : "RBAC settings could not be loaded."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const groupedPermissions = useMemo(() => data.permissions.reduce<Record<string, Permission[]>>((groups, permission) => {
    (groups[permission.module] ??= []).push(permission);
    return groups;
  }, {}), [data.permissions]);
  const shownUsers = useMemo(() => data.users.filter(user => (user.name + " " + user.email).toLowerCase().includes(userSearch.toLowerCase())), [data.users, userSearch]);

  function editRole(role: Role) {
    setRoleId(role.id);
    setDraft({ name: role.name, slug: role.slug, description: role.description || "", permissionIds: [...role.permissionIds] });
    setError(""); setMessage("");
  }
  function newRole() { setRoleId(null); setDraft(blank()); setError(""); setMessage(""); }
  function togglePermission(id: number) {
    setDraft(current => ({ ...current, permissionIds: current.permissionIds.includes(id) ? current.permissionIds.filter(value => value !== id) : [...current.permissionIds, id] }));
  }
  async function saveRole() {
    setBusy(true); setError(""); setMessage("");
    try {
      const response = await fetch("/api/admin/roles", { method: roleId ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...draft, id: roleId, slug: slugify(draft.slug || draft.name) }) });
      const payload = await response.json() as { success?: boolean; message?: string };
      if (!response.ok || !payload.success) throw new Error(payload.message || "Role could not be saved.");
      setMessage("Role and permissions saved.");
      await loadData();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Role could not be saved."); }
    finally { setBusy(false); }
  }
  async function deleteRole(role: Role) {
    if (!window.confirm("Delete the " + role.name + " role?")) return;
    setBusy(true); setError(""); setMessage("");
    try {
      const response = await fetch("/api/admin/roles?id=" + role.id, { method: "DELETE" });
      const payload = await response.json() as { success?: boolean; message?: string };
      if (!response.ok || !payload.success) throw new Error(payload.message || "Role could not be deleted.");
      if (roleId === role.id) newRole();
      setMessage("Role deleted."); await loadData();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Role could not be deleted."); }
    finally { setBusy(false); }
  }
  function selectUser(id: number) {
    const user = data.users.find(item => item.id === id);
    setUserId(id); setRoleIds(user?.roleIds ?? []);
  }
  async function saveAssignment() {
    if (!userId) { setError("Choose a user first."); return; }
    setBusy(true); setError(""); setMessage("");
    try {
      const response = await fetch("/api/admin/roles/assignments", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId, roleIds }) });
      const payload = await response.json() as { success?: boolean; message?: string };
      if (!response.ok || !payload.success) throw new Error(payload.message || "Staff access could not be saved.");
      setMessage("Staff roles saved."); await loadData();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Staff access could not be saved."); }
    finally { setBusy(false); }
  }

  return <main className="min-h-[calc(100vh-72px)] bg-[#faf8f6] p-4 sm:p-6 lg:p-8"><div className="mx-auto max-w-7xl">
    <header><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#a87567]">Access control</p><h1 className="mt-1 text-2xl font-semibold text-[#292321]">Roles &amp; Permissions</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-[#857974]">Create staff roles, choose exactly which areas they can access, and assign roles to user accounts. Staff roles need “Access Admin” to sign in.</p></header>
    {error && <p role="alert" className="mt-5 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</p>}{message && <p role="status" className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{message}</p>}
    {loading ? <p className="mt-6 rounded-xl border bg-white p-6 text-sm text-[#857974]">Loading role and permission records…</p> : <div className="mt-6 grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
      <div className="space-y-6">
        <section className="overflow-hidden rounded-xl border border-[#eee6e1] bg-white shadow-sm"><div className="flex items-center justify-between border-b px-5 py-4"><div><h2 className="font-semibold text-[#292321]">Roles <span className="ml-1 text-xs font-normal text-[#958b86]">{data.roles.length}</span></h2><p className="mt-1 text-xs text-[#958b86]">The built-in Super Admin role always keeps full permissions.</p></div><button type="button" onClick={newRole} className="rounded-lg bg-[#292321] px-4 py-2.5 text-xs font-semibold text-white">Create role</button></div>
          <div className="divide-y divide-[#f0e9e5]">{data.roles.map(role => <article key={role.id} className="flex flex-wrap items-center gap-3 p-4 sm:px-5"><div className="min-w-0 flex-1"><p className="font-medium text-[#292321]">{role.name}</p><p className="mt-1 text-xs text-[#958b86]">{role.slug} · {role.permissionIds.length} permissions · {role.assignedUsers} users</p>{role.description && <p className="mt-1 text-xs text-[#766c67]">{role.description}</p>}</div><button type="button" onClick={() => editRole(role)} className="rounded-lg border px-3 py-2 text-xs font-medium">Edit access</button>{role.slug !== "super-admin" && <button type="button" onClick={() => void deleteRole(role)} disabled={busy || role.assignedUsers > 0} title={role.assignedUsers ? "Remove this role from all users before deleting." : undefined} className="rounded-lg border border-rose-200 px-3 py-2 text-xs text-rose-700 disabled:opacity-40">Delete</button>}</article>)}</div>
        </section>
        <section className="rounded-xl border border-[#eee6e1] bg-white p-5 shadow-sm sm:p-6"><div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="font-semibold text-[#292321]">Assign roles to users</h2><p className="mt-1 text-xs text-[#958b86]">Search registered accounts and grant only the access each staff member needs.</p></div><Field label="Search users"><input value={userSearch} onChange={event => setUserSearch(event.target.value)} placeholder="Name or email" /></Field></div>
          <div className="mt-4 max-h-72 overflow-auto rounded-lg border border-[#eee6e1]">{shownUsers.map(user => <button key={user.id} type="button" onClick={() => selectUser(user.id)} className={"flex w-full items-center justify-between gap-3 border-b px-3 py-3 text-left last:border-0 " + (userId === user.id ? "bg-[#f8efec]" : "hover:bg-[#fcfaf9]")}><span className="min-w-0"><span className="block truncate text-sm font-medium">{user.name}</span><span className="block truncate text-xs text-[#958b86]">{user.email}</span></span><span className="shrink-0 text-[10px] text-[#8a6256]">{user.roleIds.length ? user.roleIds.length + " role(s)" : "No admin role"}</span></button>)}</div>
          {userId && <div className="mt-4 rounded-lg border border-[#eee6e1] bg-[#fcfaf9] p-4"><p className="text-sm font-medium text-[#292321]">Role assignment</p><div className="mt-3 grid gap-2 sm:grid-cols-2">{data.roles.map(role => <label key={role.id} className="flex items-center gap-2 text-sm text-[#625954]"><input type="checkbox" checked={roleIds.includes(role.id)} disabled={role.slug === "super-admin" && !data.users.find(user => user.id === userId)?.isSuperAdmin} onChange={event => setRoleIds(current => event.target.checked ? [...current, role.id] : current.filter(id => id !== role.id))} />{role.name}</label>)}</div><button type="button" onClick={() => void saveAssignment()} disabled={busy} className="mt-4 rounded-lg bg-[#292321] px-4 py-2.5 text-xs font-semibold text-white disabled:opacity-50">{busy ? "Saving…" : "Save user roles"}</button></div>}
        </section>
      </div>
      <section className="rounded-xl border border-[#eee6e1] bg-white shadow-sm"><div className="border-b px-5 py-4"><h2 className="font-semibold text-[#292321]">{roleId ? "Edit role" : "Create a role"}</h2><p className="mt-1 text-xs text-[#958b86]">Select permissions by module and action.</p></div><div className="space-y-4 p-5">
        <Field label="Role name"><input maxLength={100} value={draft.name} onChange={event => setDraft(current => ({ ...current, name: event.target.value, ...(roleId ? {} : { slug: slugify(event.target.value) }) }))} placeholder="e.g. Inventory Manager" /></Field>
        <Field label="Role slug"><input maxLength={100} value={draft.slug} onChange={event => setDraft(current => ({ ...current, slug: slugify(event.target.value) }))} placeholder="inventory-manager" /></Field>
        <Field label="Description"><textarea rows={2} maxLength={500} value={draft.description} onChange={event => setDraft(current => ({ ...current, description: event.target.value }))} /></Field>
        <div className="max-h-[55vh] space-y-3 overflow-y-auto pr-1">{Object.entries(groupedPermissions).map(([module, permissions]) => <fieldset key={module} className="rounded-lg border border-[#eee6e1] p-3"><legend className="px-1 text-xs font-semibold capitalize text-[#8a6256]">{module.replaceAll("-", " ")}</legend><div className="space-y-2">{permissions.map(permission => <label key={permission.id} className="flex items-center gap-2 text-xs text-[#625954]"><input type="checkbox" checked={draft.permissionIds.includes(permission.id)} disabled={roleId !== null && data.roles.find(role => role.id === roleId)?.slug === "super-admin"} onChange={() => togglePermission(permission.id)} className="accent-[#9b5c5c]" />{permission.name || module + " " + permission.action}</label>)}</div></fieldset>)}</div>
        <button type="button" onClick={() => void saveRole()} disabled={busy || (roleId !== null && data.roles.find(role => role.id === roleId)?.slug === "super-admin")} className="h-11 w-full rounded-lg bg-[#292321] text-sm font-semibold text-white disabled:opacity-50">{busy ? "Saving…" : roleId ? "Save role changes" : "Create role"}</button>
      </div></section>
    </div>}
  </div></main>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block min-w-[180px] text-sm font-medium text-[#625954]">{label}<span className="mt-1.5 block [&_input]:h-10 [&_input]:w-full [&_input]:rounded-lg [&_input]:border [&_input]:border-[#ded6d1] [&_input]:px-3 [&_input]:text-sm [&_input]:outline-none [&_textarea]:w-full [&_textarea]:resize-y [&_textarea]:rounded-lg [&_textarea]:border [&_textarea]:border-[#ded6d1] [&_textarea]:p-3 [&_textarea]:text-sm [&_textarea]:outline-none">{children}</span></label>;
}
