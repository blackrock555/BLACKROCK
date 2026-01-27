"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button, Badge, Card, CardBody, EmptyState } from "@/components/ui";
import {
  MessageCircle,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  RefreshCw,
  Inbox,
  Loader2,
} from "lucide-react";

interface Ticket {
  _id: string;
  ticketNumber: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  messages: Array<{
    senderType: string;
    createdAt: string;
  }>;
}

const STATUS_STYLES: Record<string, { variant: "success" | "warning" | "info" | "danger" | "default"; label: string }> = {
  OPEN: { variant: "warning", label: "Open" },
  IN_PROGRESS: { variant: "info", label: "In Progress" },
  AWAITING_RESPONSE: { variant: "warning", label: "Awaiting Response" },
  RESOLVED: { variant: "success", label: "Resolved" },
  CLOSED: { variant: "default", label: "Closed" },
};

const PRIORITY_STYLES: Record<string, { variant: "danger" | "warning" | "info" | "default"; label: string }> = {
  URGENT: { variant: "danger", label: "Urgent" },
  HIGH: { variant: "warning", label: "High" },
  MEDIUM: { variant: "info", label: "Medium" },
  LOW: { variant: "default", label: "Low" },
};

export default function SupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const fetchTickets = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/support?status=${filter}`);
      const data = await response.json();
      if (response.ok) {
        setTickets(data.tickets || []);
      }
    } catch (error) {
      console.error("Failed to fetch tickets:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [filter]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getLastReply = (ticket: Ticket) => {
    const lastMessage = ticket.messages[ticket.messages.length - 1];
    if (!lastMessage) return null;
    return {
      isAdmin: lastMessage.senderType === "ADMIN",
      date: formatDate(lastMessage.createdAt),
    };
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-brand-400" />
            Support Center
          </h1>
          <p className="text-surface-400 mt-1">
            Get help with your account and transactions
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="ghost"
            icon={<RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />}
            onClick={fetchTickets}
            disabled={isLoading}
          >
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Button href="/support/new" variant="primary" icon={<Plus className="w-4 h-4" />}>
            New Ticket
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { value: "all", label: "All Tickets" },
          { value: "open", label: "Open" },
          { value: "in_progress", label: "In Progress" },
          { value: "awaiting_response", label: "Awaiting Response" },
          { value: "resolved", label: "Resolved" },
          { value: "closed", label: "Closed" },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              filter === tab.value
                ? "bg-brand-500/20 text-brand-400 border border-brand-500/30"
                : "bg-surface-800 text-surface-400 hover:text-white hover:bg-surface-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tickets List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
        </div>
      ) : tickets.length === 0 ? (
        <Card>
          <CardBody className="py-16">
            <EmptyState
              icon={<Inbox className="w-12 h-12" />}
              title="No support tickets"
              description={
                filter === "all"
                  ? "You haven't created any support tickets yet"
                  : `No ${filter.replace("_", " ")} tickets found`
              }
              action={{
                label: "Create Your First Ticket",
                href: "/support/new"
              }}
            />
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket, index) => {
            const lastReply = getLastReply(ticket);
            const statusStyle = STATUS_STYLES[ticket.status] || STATUS_STYLES.OPEN;
            const priorityStyle = PRIORITY_STYLES[ticket.priority] || PRIORITY_STYLES.MEDIUM;

            return (
              <motion.div
                key={ticket._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link href={`/support/${ticket._id}`}>
                  <div className="bg-surface-900 border border-surface-800 rounded-xl p-4 hover:border-surface-700 transition-all cursor-pointer group">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      {/* Main Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-surface-500 font-mono">
                            {ticket.ticketNumber}
                          </span>
                          <Badge variant={priorityStyle.variant} className="text-[10px]">
                            {priorityStyle.label}
                          </Badge>
                        </div>
                        <h3 className="text-white font-medium truncate group-hover:text-brand-400 transition-colors">
                          {ticket.subject}
                        </h3>
                        <div className="flex items-center gap-3 mt-1 text-sm text-surface-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(ticket.createdAt)}
                          </span>
                          {lastReply && (
                            <span className="flex items-center gap-1">
                              {lastReply.isAdmin ? (
                                <>
                                  <CheckCircle className="w-3 h-3 text-green-400" />
                                  <span className="text-green-400">Support replied</span>
                                </>
                              ) : (
                                <>
                                  <AlertCircle className="w-3 h-3" />
                                  <span>You replied</span>
                                </>
                              )}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Status & Arrow */}
                      <div className="flex items-center gap-3">
                        <Badge variant={statusStyle.variant}>{statusStyle.label}</Badge>
                        <ChevronRight className="w-5 h-5 text-surface-500 group-hover:text-brand-400 transition-colors" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
