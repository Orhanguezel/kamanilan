export interface NewsItem {
  title:   string;
  link:    string;
  pubDate: string | null;
  source:  string;
}

export interface NewsFeedResponse {
  items: NewsItem[];
}
