"use client";

import { useState, useEffect } from "react";
import { Badge, Button, Input, Skeleton, Pagination } from "@/components/ui";
import {
  Users,
  Search,
  RefreshCw,
  Eye,
  Ban,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";

interface User {
  _id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  status: "ACTIVE" | "SUSPENDED";
  balance: number;
  depositBalance: number;
  kycStatus: "NOT_SUBMITTED" | "PENDING" | "APPROVED" | "REJECTED";
  referralCount: number;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "10",
      });
      if (search) params.append("search", search);

      const response = await fetch(`/api/admin/users?${params}`);
      const data = await response.json();

      if (response.ok) {
        setUsers(data.users || []);
        setTotalPages(data.pagination?.pages || 1);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getKYCVariant = (
    status: string
  ): "success" | "warning" | "danger" | "info" => {
    switch (status) {
      case "APPROVED":
        return "success";
      case "PENDING":
        return "warning";
      case "REJECTED":
        return "danger";
      default:
        return "info";
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Users</h1>
          <p className="text-surface-400 mt-1">Manage platform users</p>
        </div>
        <Button
          onClick={fetchUsers}
          variant="secondary"
          icon={<RefreshCw className="w-4 h-4" />}
        >
          Refresh
        </Button>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Search by name or email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            icon={<Search className="w-5 h-5" />}
          />
        </div>
        <Button type="submit" variant="primary">
          Search
        </Button>
      </form>

      {/* Users Table */}
      <div className="bg-surface-900 border border-surface-800 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="w-12 h-12 text-surface-600 mx-auto mb-4" />
            <p className="text-surface-400">No users found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-surface-800">
                    <th className="text-left text-surface-400 font-medium p-4 text-sm">
                      User
                    </th>
                    <th className="text-left text-surface-400 font-medium p-4 text-sm">
                      Balance
                    </th>
                    <th className="text-left text-surface-400 font-medium p-4 text-sm">
                      KYC
                    </th>
                    <th className="text-left text-surface-400 font-medium p-4 text-sm">
                      Status
                    </th>
                    <th className="text-left text-surface-400 font-medium p-4 text-sm">
                      Referrals
                    </th>
                    <th className="text-left text-surface-400 font-medium p-4 text-sm">
                      Joined
                    </th>
                    <th className="text-right text-surface-400 font-medium p-4 text-sm">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user._id}
                      className="border-b border-surface-800 last:border-0 hover:bg-surface-800/50"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-brand-500/20 flex items-center justify-center">
                            <span className="text-brand-400 font-medium">
                              {user.name?.charAt(0).toUpperCase() || "?"}
                            </span>
                          </div>
                          <div>
                            <p className="text-white font-medium">{user.name}</p>
                            <p className="text-surface-500 text-sm">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-white font-semibold">
                          ${user.balance.toLocaleString()}
                        </p>
                        <p className="text-surface-500 text-sm">
                          Deposit: ${user.depositBalance.toLocaleString()}
                        </p>
                      </td>
                      <td className="p-4">
                        <Badge variant={getKYCVariant(user.kycStatus)}>
                          {user.kycStatus.replace("_", " ")}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Badge
                          variant={
                            user.status === "ACTIVE" ? "success" : "danger"
                          }
                        >
                          {user.status}
                        </Badge>
                      </td>
                      <td className="p-4 text-surface-300">
                        {user.referralCount}
                      </td>
                      <td className="p-4 text-surface-400 text-sm">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="p-4 text-right">
                        <Link href={`/admin/users/${user._id}`}>
                          <Button
                            variant="secondary"
                            size="sm"
                            icon={<Eye className="w-4 h-4" />}
                          >
                            View
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="border-t border-surface-800 p-4">
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
