"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type CustomerStatus = "Active" | "Inactive";

interface Customer {
  id: number;
  name: string;
  email: string;
  mobile: string;
  orders: number;
  spent: number;
  lastOrder: string;
  joined: string;
  status: CustomerStatus;
}

const initialCustomers: Customer[] = [
  {
    id: 1,
    name: "Susmita Ghosh",
    email: "susmita@example.com",
    mobile: "9876543210",
    orders: 8,
    spent: 12450,
    lastOrder: "11 Sep 2026",
    joined: "12 Jan 2026",
    status: "Active",
  },
  {
    id: 2,
    name: "Ananya Roy",
    email: "ananya@example.com",
    mobile: "9830012345",
    orders: 5,
    spent: 8799,
    lastOrder: "11 Sep 2026",
    joined: "20 Feb 2026",
    status: "Active",
  },
  {
    id: 3,
    name: "Madhumita Sen",
    email: "madhumita@example.com",
    mobile: "9007012345",
    orders: 11,
    spent: 18990,
    lastOrder: "10 Sep 2026",
    joined: "05 Dec 2025",
    status: "Active",
  },
  {
    id: 4,
    name: "Riya Das",
    email: "riya@example.com",
    mobile: "8910123456",
    orders: 3,
    spent: 4297,
    lastOrder: "08 Sep 2026",
    joined: "15 Mar 2026",
    status: "Active",
  },
  {
    id: 5,
    name: "Puja Chakraborty",
    email: "puja@example.com",
    mobile: "9836123456",
    orders: 1,
    spent: 1499,
    lastOrder: "05 Sep 2026",
    joined: "05 Sep 2026",
    status: "Active",
  },
  {
    id: 6,
    name: "Moumita Paul",
    email: "moumita@example.com",
    mobile: "9123456780",
    orders: 0,
    spent: 0,
    lastOrder: "—",
    joined: "28 Aug 2026",
    status: "Inactive",
  },
  {
    id: 7,
    name: "Sreya Mukherjee",
    email: "sreya@example.com",
    mobile: "9876123450",
    orders: 6,
    spent: 9450,
    lastOrder: "02 Sep 2026",
    joined: "10 Jan 2026",
    status: "Active",
  },
  {
    id: 8,
    name: "Tania Dutta",
    email: "tania@example.com",
    mobile: "9007123456",
    orders: 2,
    spent: 2898,
    lastOrder: "30 Aug 2026",
    joined: "18 Jun 2026",
    status: "Active",
  },
  {
    id: 9,
    name: "Debolina Ghosh",
    email: "debolina@example.com",
    mobile: "9831012345",
    orders: 4,
    spent: 6496,
    lastOrder: "28 Aug 2026",
    joined: "22 Apr 2026",
    status: "Inactive",
  },
  {
    id: 10,
    name: "Nandini Roy",
    email: "nandini@example.com",
    mobile: "8910987654",
    orders: 7,
    spent: 11299,
    lastOrder: "25 Aug 2026",
    joined: "02 Feb 2026",
    status: "Active",
  },
];

// Customers are loaded exclusively from the database.
initialCustomers.length = 0;

function formatCurrency(value: number) {
  return `₹${value.toLocaleString("en-IN")}`;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function SearchIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
      <circle cx="9.5" cy="7" r="4" />
      <path d="M21 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function UserPlusIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
    >
      <path d="M15 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="8.5" cy="7" r="4" />
      <path d="M19 8v6" />
      <path d="M22 11h-6" />
    </svg>
  );
}

function UserCheckIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
    >
      <path d="M15 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="8.5" cy="7" r="4" />
      <path d="m16 11 2 2 4-4" />
    </svg>
  );
}

function ShoppingBagIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
    >
      <path d="M5 8h14l1 13H4L5 8Z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
    >
      <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4L16.5 3.5Z" />
    </svg>
  );
}

function MoreIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <circle cx="5" cy="12" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="19" cy="12" r="1.5" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export default function CustomersPage() {
  const [customers, setCustomers] =
    useState<Customer[]>(initialCustomers);

  useEffect(() => {
    fetch("/api/customers").then((response) => response.json()).then((payload) => {
      if (!payload.success) return;
      setCustomers(payload.data.map((customer: any) => ({ id: customer.id, name: customer.name, email: customer.email, mobile: customer.mobile ?? "—", orders: customer.orders.length, spent: customer.orders.reduce((total: number, order: any) => total + Number(order.total), 0), lastOrder: customer.orders[0] ? new Date(customer.orders[0].createdAt).toLocaleDateString("en-IN") : "—", joined: new Date(customer.createdAt).toLocaleDateString("en-IN"), status: customer.status === "active" ? "Active" : "Inactive" })));
    }).catch(() => undefined);
  }, []);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "All" | CustomerStatus
  >("All");

  const filteredCustomers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return customers.filter((customer) => {
      const matchesSearch =
        !query ||
        customer.name.toLowerCase().includes(query) ||
        customer.email.toLowerCase().includes(query) ||
        customer.mobile.includes(query);

      const matchesStatus =
        statusFilter === "All" ||
        customer.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [customers, search, statusFilter]);

  const totalCustomers = customers.length;

  const activeCustomers = customers.filter(
    (customer) => customer.status === "Active"
  ).length;

  const newCustomers = customers.filter(
    (customer) => customer.joined.includes("Sep 2026")
  ).length;

  const totalOrders = customers.reduce(
    (total, customer) => total + customer.orders,
    0
  );

  const toggleStatus = (id: number) => {
    const customer = customers.find((item) => item.id === id);
    if (customer) fetch("/api/customers", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status: customer.status === "Active" ? "Inactive" : "Active" }) }).catch(() => undefined);
    setCustomers((current) =>
      current.map((customer) =>
        customer.id === id
          ? {
              ...customer,
              status:
                customer.status === "Active"
                  ? "Inactive"
                  : "Active",
            }
          : customer
      )
    );
  };

  return (
    <div className="min-h-[calc(100vh-72px)] bg-[#faf8f6]">
      {/* Header */}
      <div className="border-b border-[#eee6e1] bg-white">
        <div className="px-4 py-5 lg:px-5">
          <div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-[0.16em] text-[#a18f87]">
                  Customer Management
                </p>

                <h1 className="text-2xl font-semibold tracking-[-0.02em] text-[#292321]">
                  Customers
                </h1>

                <p className="mt-1 text-sm text-[#8b817c]">
                  Manage your customers and view their purchase activity.
                </p>
              </div>

              <Link
                href="/admin/customers/new"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#292321] px-5 text-sm font-medium text-white transition hover:bg-[#403936]"
              >
                <PlusIcon />
                Add Customer
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="px-4 py-5 lg:px-5 lg:py-6">
        <div>
          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border border-[#eee6e1] bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-[#958b86]">
                    Total Customers
                  </p>

                  <p className="mt-2 text-2xl font-semibold text-[#292321]">
                    {totalCustomers}
                  </p>

                  <p className="mt-1 text-xs text-[#958b86]">
                    Registered customers
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f7f0ec] text-[#8e7770]">
                  <UsersIcon />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-[#eee6e1] bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-[#958b86]">
                    Active Customers
                  </p>

                  <p className="mt-2 text-2xl font-semibold text-[#292321]">
                    {activeCustomers}
                  </p>

                  <p className="mt-1 text-xs text-green-600">
                    Currently active
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-green-700">
                  <UserCheckIcon />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-[#eee6e1] bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-[#958b86]">
                    New Customers
                  </p>

                  <p className="mt-2 text-2xl font-semibold text-[#292321]">
                    {newCustomers}
                  </p>

                  <p className="mt-1 text-xs text-[#958b86]">
                    Joined this month
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f7f0ec] text-[#8e7770]">
                  <UserPlusIcon />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-[#eee6e1] bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-[#958b86]">
                    Total Orders
                  </p>

                  <p className="mt-2 text-2xl font-semibold text-[#292321]">
                    {totalOrders}
                  </p>

                  <p className="mt-1 text-xs text-[#958b86]">
                    From all customers
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f7f0ec] text-[#8e7770]">
                  <ShoppingBagIcon />
                </div>
              </div>
            </div>
          </div>

          {/* Toolbar */}
          <div className="mt-6 rounded-xl border border-[#eee6e1] bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative w-full lg:max-w-md">
                <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#a09691]">
                  <SearchIcon />
                </div>

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name, email or mobile..."
                  className="h-11 w-full rounded-lg border border-[#e0d8d3] bg-white pl-10 pr-4 text-sm text-[#39322f] outline-none transition placeholder:text-[#aaa19c] focus:border-[#b56f6f]"
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) =>
                      setStatusFilter(
                        e.target.value as "All" | CustomerStatus
                      )
                    }
                    className="h-11 min-w-[150px] appearance-none rounded-lg border border-[#e0d8d3] bg-white px-4 pr-10 text-sm text-[#514945] outline-none focus:border-[#b56f6f]"
                  >
                    <option value="All">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>

                  <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8f8580]">
                    <ChevronDownIcon />
                  </div>
                </div>

                <div className="flex h-11 items-center rounded-lg border border-[#e0d8d3] bg-white px-4 text-sm text-[#7e7470]">
                  {filteredCustomers.length} customer
                  {filteredCustomers.length !== 1 ? "s" : ""}
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Table */}
          <div className="mt-6 hidden overflow-hidden rounded-xl border border-[#eee6e1] bg-white shadow-sm lg:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px]">
                <thead>
                  <tr className="border-b border-[#eee6e1] bg-[#fcfaf9]">
                    <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9a908b]">
                      Customer
                    </th>

                    <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9a908b]">
                      Contact
                    </th>

                    <th className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9a908b]">
                      Orders
                    </th>

                    <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9a908b]">
                      Total Spent
                    </th>

                    <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9a908b]">
                      Last Order
                    </th>

                    <th className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9a908b]">
                      Status
                    </th>

                    <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9a908b]">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#f0e9e5]">
                  {filteredCustomers.map((customer) => (
                    <tr
                      key={customer.id}
                      className="transition hover:bg-[#fcfaf9]"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f2e5e1] text-xs font-semibold text-[#805f57]">
                            {getInitials(customer.name)}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-[#39322f]">
                              {customer.name}
                            </p>

                            <p className="mt-0.5 text-xs text-[#9a908b]">
                              Customer #{customer.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <p className="text-sm text-[#514945]">
                          {customer.email}
                        </p>

                        <p className="mt-1 text-xs text-[#958b86]">
                          {customer.mobile}
                        </p>
                      </td>

                      <td className="px-4 py-4 text-center">
                        <span className="text-sm font-medium text-[#39322f]">
                          {customer.orders}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-right">
                        <span className="text-sm font-semibold text-[#39322f]">
                          {formatCurrency(customer.spent)}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <p className="text-sm text-[#514945]">
                          {customer.lastOrder}
                        </p>
                      </td>

                      <td className="px-4 py-4 text-center">
                        <button
                          type="button"
                          onClick={() => toggleStatus(customer.id)}
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium transition ${
                            customer.status === "Active"
                              ? "border-green-100 bg-green-50 text-green-700 hover:bg-green-100"
                              : "border-gray-100 bg-gray-50 text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          {customer.status}
                        </button>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/admin/customers/${customer.id}`}
                            title="View Customer"
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-[#817772] transition hover:bg-[#f7f0ec] hover:text-[#292321]"
                          >
                            <EyeIcon />
                          </Link>

                          <Link
                            href={`/admin/customers/${customer.id}`}
                            title="Edit Customer"
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-[#817772] transition hover:bg-[#f7f0ec] hover:text-[#292321]"
                          >
                            <EditIcon />
                          </Link>

                          <button
                            type="button"
                            title="More"
                            onClick={() =>
                              alert(
                                `More actions for ${customer.name}`
                              )
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-[#817772] transition hover:bg-[#f7f0ec] hover:text-[#292321]"
                          >
                            <MoreIcon />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredCustomers.length === 0 && (
              <div className="px-6 py-16 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#f6f1ee] text-[#978983]">
                  <SearchIcon />
                </div>

                <h3 className="mt-4 text-sm font-semibold text-[#39322f]">
                  No customers found
                </h3>

                <p className="mt-1 text-xs text-[#958b86]">
                  Try changing your search or filter.
                </p>
              </div>
            )}
          </div>

          {/* Mobile Cards */}
          <div className="mt-6 space-y-3 lg:hidden">
            {filteredCustomers.map((customer) => (
              <div
                key={customer.id}
                className="rounded-xl border border-[#eee6e1] bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f2e5e1] text-xs font-semibold text-[#805f57]">
                      {getInitials(customer.name)}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#39322f]">
                        {customer.name}
                      </p>

                      <p className="mt-0.5 truncate text-xs text-[#958b86]">
                        {customer.email}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleStatus(customer.id)}
                    className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-medium ${
                      customer.status === "Active"
                        ? "border-green-100 bg-green-50 text-green-700"
                        : "border-gray-100 bg-gray-50 text-gray-600"
                    }`}
                  >
                    {customer.status}
                  </button>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 rounded-lg bg-[#fcfaf9] p-3">
                  <div>
                    <p className="text-[11px] text-[#9a908b]">
                      Mobile
                    </p>

                    <p className="mt-1 text-xs font-medium text-[#514945]">
                      {customer.mobile}
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] text-[#9a908b]">
                      Orders
                    </p>

                    <p className="mt-1 text-xs font-medium text-[#514945]">
                      {customer.orders}
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] text-[#9a908b]">
                      Total Spent
                    </p>

                    <p className="mt-1 text-xs font-semibold text-[#39322f]">
                      {formatCurrency(customer.spent)}
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] text-[#9a908b]">
                      Last Order
                    </p>

                    <p className="mt-1 text-xs font-medium text-[#514945]">
                      {customer.lastOrder}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-end gap-2 border-t border-[#f0e9e5] pt-3">
                  <Link
                    href={`/admin/customers/${customer.id}`}
                    className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-[#ded5d0] px-3 text-xs font-medium text-[#514945] transition hover:bg-[#faf7f5]"
                  >
                    <EyeIcon />
                    View
                  </Link>

                  <Link
                    href={`/admin/customers/${customer.id}`}
                    className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-[#292321] px-3 text-xs font-medium text-white transition hover:bg-[#403936]"
                  >
                    <EditIcon />
                    Edit
                  </Link>
                </div>
              </div>
            ))}

            {filteredCustomers.length === 0 && (
              <div className="rounded-xl border border-[#eee6e1] bg-white px-6 py-16 text-center shadow-sm">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#f6f1ee] text-[#978983]">
                  <SearchIcon />
                </div>

                <h3 className="mt-4 text-sm font-semibold text-[#39322f]">
                  No customers found
                </h3>

                <p className="mt-1 text-xs text-[#958b86]">
                  Try changing your search or filter.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
