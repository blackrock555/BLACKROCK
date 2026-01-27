"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button, Badge, Card, CardBody, EmptyState, Input } from "@/components/ui";
import {
  MessageCircle,
  RefreshCw,
  Search,
  ChevronRight,
  Clock,
  User,
  Send,
  X,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";

interface TicketMessage {
  senderId: string;
  senderType: "USER" | "ADMIN";
  senderName: string;
  content: string;
  createdAt: string;
}

interface Ticket {
  _id: string;
  ticketNumber: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  messages: TicketMessage[];
  createdAt: string;
  updatedAt: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
}

interface Stats {
  open: number;
  inProgress: number;
  awaitingResponse: number;
  resolved: number;
  closed: number;
  total: number;
}

const STATUS_STYLES: Record<string, { variant: "success" | "warning" | "info" | "danger" | "default"; label: string }> = {
  OPEN: { variant: "warning", label: "Open" },
  IN_PROGRESS: { variant: "info", label: "In Progress" },
  AWAITING_RESPONSE: { variant: "warning", label: "Awaiting" },
  RESOLVED: { variant: "success", label: "Resolved" },
  CLOSED: { variant: "default", label: "Closed" },
};

const PRIORITY_STYLES: Record<string, { variant: "danger" | "warning" | "info" | "default" }> = {
  URGENT: { variant: "danger" },
  HIGH: { variant: "warning" },
  MEDIUM: { variant: "info" },
  LOW: { variant: "default" },
};

export default function AdminSupportPanel() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [newStatus, setNewStatus] = useState("");

  const fetchTickets = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/support?status=${filter}`);
      const data = await response.json();
      if (response.ok) {
        setTickets(data.tickets || []);
        setStats(data.stats || null);
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

  const handleViewTicket = async (ticketId: string) => {
    try {
      const response = await fetch(`/api/admin/support/${ticketId}`);
      const data = await response.json();
      if (response.ok) {
        setSelectedTicket(data.ticket);
        setNewStatus(data.ticket.status);
      }
    } catch (error) {
      console.error("Failed to fetch ticket:", error);
    }
  };

  const handleSendReply = async () => {
    if (!selectedTicket || (!replyMessage.trim() && !newStatus)) return;

    setIsSending(true);
    try {
      const response = await fetch(`/api/admin/support/${selectedTicket._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: replyMessage.trim() || undefined,
          status: newStatus !== selectedTicket.status ? newStatus : undefined,
        }),
      });

      if (response.ok) {
        setReplyMessage("");
        handleViewTicket(selectedTicket._id);
        fetchTickets();
      }
    } catch (error) {
      console.error("Failed to send reply:", error);
    } finally {
      setIsSending(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredTickets = tickets.filter(
    (ticket) =>
      ticket.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.userId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.userId?.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-brand-400" />
            Support Tickets
          </h2>
          <p className="text-surface-400 text-sm mt-1">
            Manage and respond to user support requests
          </p>
        </div>
        <Button
          variant="ghost"
          icon={<RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />}
          onClick={fetchTickets}
          disabled={isLoading}
        >
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: "Open", value: stats.open, color: "text-yellow-400" },
            { label: "In Progress", value: stats.inProgress, color: "text-blue-400" },
            { label: "Awaiting", value: stats.awaitingResponse, color: "text-orange-400" },
            { label: "Resolved", value: stats.resolved, color: "text-green-400" },
            { label: "Closed", value: stats.closed, color: "text-surface-400" },
            { label: "Total", value: stats.total, color: "text-white" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-surface-800/50 border border-surface-700 rounded-lg p-3 text-center"
            >
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-surface-500">{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tickets List */}
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
              <input
                type="text"
                placeholder="Search tickets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-surface-800 border border-surface-700 rounded-lg text-white text-sm placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
              />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 bg-surface-800 border border-surface-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="awaiting_response">Awaiting</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          {/* Tickets */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
            </div>
          ) : filteredTickets.length === 0 ? (
            <Card>
              <CardBody className="py-8 text-center">
                <MessageCircle className="w-10 h-10 text-surface-500 mx-auto mb-3" />
                <p className="text-surface-400">No tickets found</p>
              </CardBody>
            </Card>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {filteredTickets.map((ticket) => {
                const statusStyle = STATUS_STYLES[ticket.status] || STATUS_STYLES.OPEN;
                const priorityStyle = PRIORITY_STYLES[ticket.priority] || PRIORITY_STYLES.MEDIUM;
                const isSelected = selectedTicket?._id === ticket._id;

                return (
                  <div
                    key={ticket._id}
                    onClick={() => handleViewTicket(ticket._id)}
                    className={`p-3 rounded-lg cursor-pointer transition-all ${
                      isSelected
                        ? "bg-brand-500/10 border border-brand-500/30"
                        : "bg-surface-800/50 border border-surface-700 hover:bg-surface-800"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-surface-500 font-mono">
                            {ticket.ticketNumber}
                          </span>
                          <Badge variant={priorityStyle.variant} className="text-[10px]">
                            {ticket.priority}
                          </Badge>
                        </div>
                        <p className="text-white text-sm font-medium truncate">
                          {ticket.subject}
                        </p>
                        <p className="text-surface-500 text-xs mt-1">
                          {ticket.userId?.name || "Unknown"} • {formatDate(ticket.createdAt)}
                        </p>
                      </div>
                      <Badge variant={statusStyle.variant} className="text-[10px]">
                        {statusStyle.label}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Ticket Detail */}
        <Card className="sticky top-4">
          <CardBody className="p-0">
            {selectedTicket ? (
              <div className="flex flex-col h-[600px]">
                {/* Header */}
                <div className="p-4 border-b border-surface-700">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs text-surface-500 font-mono mb-1">
                        {selectedTicket.ticketNumber}
                      </p>
                      <h3 className="text-white font-medium">{selectedTicket.subject}</h3>
                      <p className="text-surface-400 text-sm mt-1">
                        {selectedTicket.userId?.name} ({selectedTicket.userId?.email})
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedTicket(null)}
                      className="p-1 text-surface-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Status Selector */}
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-xs text-surface-500">Status:</span>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="px-2 py-1 bg-surface-800 border border-surface-700 rounded text-white text-xs focus:outline-none"
                    >
                      <option value="OPEN">Open</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="AWAITING_RESPONSE">Awaiting Response</option>
                      <option value="RESOLVED">Resolved</option>
                      <option value="CLOSED">Closed</option>
                    </select>
                    {newStatus !== selectedTicket.status && (
                      <button
                        onClick={handleSendReply}
                        className="text-xs text-brand-400 hover:text-brand-300"
                      >
                        Update
                      </button>
                    )}
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {selectedTicket.messages.map((msg, index) => {
                    const isAdmin = msg.senderType === "ADMIN";
                    return (
                      <div
                        key={index}
                        className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-lg p-3 ${
                            isAdmin
                              ? "bg-brand-500/20 border border-brand-500/30"
                              : "bg-surface-800 border border-surface-700"
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`text-xs font-medium ${
                                isAdmin ? "text-brand-400" : "text-white"
                              }`}
                            >
                              {msg.senderName}
                            </span>
                            <span className="text-[10px] text-surface-500">
                              {formatDate(msg.createdAt)}
                            </span>
                          </div>
                          <p className="text-surface-300 text-sm whitespace-pre-wrap">
                            {msg.content}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Reply Form */}
                {selectedTicket.status !== "CLOSED" && (
                  <div className="p-4 border-t border-surface-700">
                    <div className="flex gap-2">
                      <textarea
                        placeholder="Type your reply..."
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        rows={2}
                        className="flex-1 px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-white text-sm placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 resize-none"
                      />
                      <Button
                        variant="primary"
                        icon={<Send className="w-4 h-4" />}
                        onClick={handleSendReply}
                        isLoading={isSending}
                        disabled={!replyMessage.trim()}
                        className="self-end"
                      >
                        Send
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[600px] text-center p-6">
                <MessageCircle className="w-12 h-12 text-surface-600 mb-3" />
                <p className="text-surface-400">Select a ticket to view details</p>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
