"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button, Badge, Card, CardBody, Alert } from "@/components/ui";
import {
  MessageCircle,
  ArrowLeft,
  Send,
  Clock,
  User,
  Shield,
  AlertCircle,
  Loader2,
  CheckCircle,
} from "lucide-react";

interface TicketMessage {
  senderId: string;
  senderType: "USER" | "ADMIN";
  senderName: string;
  content: string;
  attachments?: string[];
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

const CATEGORY_LABELS: Record<string, string> = {
  GENERAL: "General Inquiry",
  DEPOSIT: "Deposit Issue",
  WITHDRAWAL: "Withdrawal Issue",
  KYC: "KYC/Verification",
  TECHNICAL: "Technical Support",
  OTHER: "Other",
};

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState("");

  const fetchTicket = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/support/${params.id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch ticket");
      }

      setTicket(data.ticket);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load ticket");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
  }, [params.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [ticket?.messages]);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!replyMessage.trim()) return;

    setIsSending(true);
    setError(null);

    try {
      const response = await fetch(`/api/support/${params.id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: replyMessage }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send reply");
      }

      setReplyMessage("");
      fetchTicket();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send reply");
    } finally {
      setIsSending(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <Card>
        <CardBody className="py-16 text-center">
          <AlertCircle className="w-12 h-12 text-surface-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Ticket Not Found</h2>
          <p className="text-surface-400 mb-6">
            {error || "The requested ticket could not be found."}
          </p>
          <Button href="/support" variant="primary">
            Back to Support
          </Button>
        </CardBody>
      </Card>
    );
  }

  const statusStyle = STATUS_STYLES[ticket.status] || STATUS_STYLES.OPEN;
  const priorityStyle = PRIORITY_STYLES[ticket.priority] || PRIORITY_STYLES.MEDIUM;
  const isClosed = ticket.status === "CLOSED";

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button
          variant="ghost"
          icon={<ArrowLeft className="w-4 h-4" />}
          onClick={() => router.push("/support")}
        >
          Back
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-sm text-surface-500 font-mono">
              {ticket.ticketNumber}
            </span>
            <Badge variant={statusStyle.variant}>{statusStyle.label}</Badge>
            <Badge variant={priorityStyle.variant}>{priorityStyle.label}</Badge>
          </div>
          <h1 className="text-xl font-bold text-white truncate">{ticket.subject}</h1>
          <div className="flex items-center gap-4 mt-1 text-sm text-surface-400">
            <span>{CATEGORY_LABELS[ticket.category] || ticket.category}</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDate(ticket.createdAt)}
            </span>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="danger" icon={<AlertCircle className="w-5 h-5" />} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Messages */}
      <Card>
        <CardBody className="p-0">
          <div className="max-h-[500px] overflow-y-auto p-4 space-y-4">
            {ticket.messages.map((message, index) => {
              const isAdmin = message.senderType === "ADMIN";
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex ${isAdmin ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`max-w-[80%] ${
                      isAdmin
                        ? "bg-surface-800 border border-surface-700"
                        : "bg-brand-500/20 border border-brand-500/30"
                    } rounded-2xl p-4`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {isAdmin ? (
                        <div className="w-6 h-6 bg-brand-500 rounded-full flex items-center justify-center">
                          <Shield className="w-3 h-3 text-white" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 bg-surface-600 rounded-full flex items-center justify-center">
                          <User className="w-3 h-3 text-white" />
                        </div>
                      )}
                      <span className={`text-sm font-medium ${isAdmin ? "text-brand-400" : "text-white"}`}>
                        {message.senderName}
                      </span>
                      <span className="text-xs text-surface-500">
                        {formatDate(message.createdAt)}
                      </span>
                    </div>
                    <p className="text-surface-300 whitespace-pre-wrap text-sm">
                      {message.content}
                    </p>
                  </div>
                </motion.div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        </CardBody>
      </Card>

      {/* Reply Form */}
      {isClosed ? (
        <Card>
          <CardBody className="text-center py-6">
            <CheckCircle className="w-8 h-8 text-surface-500 mx-auto mb-2" />
            <p className="text-surface-400">
              This ticket has been closed. Create a new ticket if you need further assistance.
            </p>
          </CardBody>
        </Card>
      ) : (
        <Card>
          <CardBody>
            <form onSubmit={handleSendReply} className="flex gap-3">
              <textarea
                placeholder="Type your reply..."
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                rows={3}
                maxLength={5000}
                className="flex-1 px-4 py-3 bg-surface-800 border border-surface-700 rounded-xl text-white placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 resize-none"
              />
              <Button
                type="submit"
                variant="primary"
                icon={<Send className="w-4 h-4" />}
                isLoading={isSending}
                disabled={!replyMessage.trim()}
                className="self-end"
              >
                Send
              </Button>
            </form>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
