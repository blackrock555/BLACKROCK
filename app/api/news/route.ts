import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 300; // 5 minutes

interface NewsItem {
  id: string;
  title: string;
  source: string;
  url: string;
  publishedAt: string;
  summary?: string;
}

// Curated fallback news items when no API key is configured
function getFallbackNews(): NewsItem[] {
  const now = new Date();
  return [
    {
      id: "1",
      title: "Gold Prices Reach New Highs Amid Global Uncertainty",
      source: "Reuters",
      url: "#",
      publishedAt: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(),
      summary: "Gold prices continue their upward trend as investors seek safe-haven assets amid geopolitical tensions.",
    },
    {
      id: "2",
      title: "Bitcoin Surges Past Key Resistance Level",
      source: "CoinDesk",
      url: "#",
      publishedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      summary: "Bitcoin breaks through a key technical level, signaling potential for further gains in the cryptocurrency market.",
    },
    {
      id: "3",
      title: "Federal Reserve Signals Steady Rate Path for Coming Months",
      source: "Bloomberg",
      url: "#",
      publishedAt: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(),
      summary: "The Federal Reserve indicates a cautious approach to interest rate adjustments in its latest policy statement.",
    },
    {
      id: "4",
      title: "US Dollar Index Holds Steady After Economic Data Release",
      source: "Financial Times",
      url: "#",
      publishedAt: new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString(),
      summary: "The dollar index remains stable following mixed economic indicators from the latest jobs and manufacturing reports.",
    },
    {
      id: "5",
      title: "Oil Prices Rise on Supply Concerns and Demand Outlook",
      source: "CNBC",
      url: "#",
      publishedAt: new Date(now.getTime() - 7 * 60 * 60 * 1000).toISOString(),
      summary: "Crude oil prices climb as traders weigh global supply constraints against improving demand forecasts.",
    },
    {
      id: "6",
      title: "European Markets Rally on Strong Earnings Reports",
      source: "MarketWatch",
      url: "#",
      publishedAt: new Date(now.getTime() - 9 * 60 * 60 * 1000).toISOString(),
      summary: "European stock indices gain momentum as major companies report better-than-expected quarterly earnings.",
    },
  ];
}

async function fetchFinnhubNews(): Promise<NewsItem[] | null> {
  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch(
      `https://finnhub.io/api/v1/news?category=general&token=${apiKey}`,
      { next: { revalidate: 300 } }
    );

    if (!response.ok) return null;

    const data = await response.json();
    return data.slice(0, 6).map((item: any, index: number) => ({
      id: String(item.id || index),
      title: item.headline,
      source: item.source,
      url: item.url,
      publishedAt: new Date(item.datetime * 1000).toISOString(),
      summary: item.summary?.slice(0, 150),
    }));
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    // Try Finnhub API first
    const liveNews = await fetchFinnhubNews();

    if (liveNews && liveNews.length > 0) {
      return NextResponse.json({ news: liveNews, source: "live" });
    }

    // Fallback to curated news
    return NextResponse.json({ news: getFallbackNews(), source: "fallback" });
  } catch (error) {
    console.error("News API error:", error);
    return NextResponse.json({ news: getFallbackNews(), source: "fallback" });
  }
}
