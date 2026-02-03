"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardHeader, CardBody } from "@/components/ui";
import { motion } from "framer-motion";
import {
  Newspaper,
  ExternalLink,
  RefreshCw,
  Clock,
} from "lucide-react";

interface NewsItem {
  id: string;
  title: string;
  source: string;
  url: string;
  publishedAt: string;
  summary?: string;
}

function formatTimeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}

const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

export function MarketNewsCard() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchNews = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/news");
      if (response.ok) {
        const data = await response.json();
        setNews(data.news || []);
      }
    } catch (error) {
      console.error("Failed to fetch news:", error);
    } finally {
      setIsLoading(false);
      setLastRefresh(new Date());
    }
  }, []);

  useEffect(() => {
    fetchNews();
    const interval = setInterval(fetchNews, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchNews]);

  return (
    <Card className="h-full">
      <CardHeader
        title="Market News"
        subtitle="Latest financial headlines"
        compact
        action={
          <button
            onClick={fetchNews}
            disabled={isLoading}
            className="p-2 rounded-lg bg-surface-800/50 hover:bg-surface-700/50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 text-surface-400 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        }
      />
      <CardBody className="p-0">
        {isLoading && news.length === 0 ? (
          <div className="p-6 space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse space-y-2">
                <div className="h-4 bg-surface-700 rounded w-3/4"></div>
                <div className="h-3 bg-surface-700 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="divide-y divide-surface-800">
            {news.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <a
                  href={item.url !== "#" ? item.url : undefined}
                  target={item.url !== "#" ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="block px-4 py-3.5 hover:bg-surface-800/50 transition-colors group"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-brand-500/10 rounded-lg flex items-center justify-center mt-0.5">
                      <Newspaper className="w-4 h-4 text-brand-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-white group-hover:text-brand-400 transition-colors line-clamp-2">
                        {item.title}
                      </h4>
                      {item.summary && (
                        <p className="text-xs text-surface-500 mt-1 line-clamp-1">
                          {item.summary}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-[10px] font-medium text-brand-400/70 uppercase tracking-wide">
                          {item.source}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] text-surface-500">
                          <Clock className="w-2.5 h-2.5" />
                          {formatTimeAgo(item.publishedAt)}
                        </span>
                      </div>
                    </div>
                    {item.url !== "#" && (
                      <ExternalLink className="w-3.5 h-3.5 text-surface-600 group-hover:text-brand-400 flex-shrink-0 mt-1 transition-colors" />
                    )}
                  </div>
                </a>
              </motion.div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="px-4 py-2.5 border-t border-surface-800 bg-surface-900/50">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-surface-500">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </span>
            <span className="text-[10px] text-surface-500">
              Auto-refreshes every 5 min
            </span>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
