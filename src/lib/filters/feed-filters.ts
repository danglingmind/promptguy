export type FeedFilterKey = 'latest' | 'popular' | 'trending'

export interface FeedFilterStrategy {
  key: FeedFilterKey
  label: string
  /**
   * Translate this strategy into API query parameters.
   * Never returns undefined keys to keep URLs clean.
   */
  getQueryParams(): Record<string, string>
}

class LatestFilter implements FeedFilterStrategy {
  public readonly key: FeedFilterKey = 'latest'
  public readonly label = 'Latest'
  public getQueryParams(): Record<string, string> {
    return { sortBy: 'createdAt', order: 'desc' }
  }
}

class PopularFilter implements FeedFilterStrategy {
  public readonly key: FeedFilterKey = 'popular'
  public readonly label = 'Popular'
  public getQueryParams(): Record<string, string> {
    return { sortBy: 'likesCount', order: 'desc' }
  }
}

class TrendingFilter implements FeedFilterStrategy {
  public readonly key: FeedFilterKey = 'trending'
  public readonly label = 'Trending'
  public getQueryParams(): Record<string, string> {
    // Basic heuristic: most views recently → using viewsCount desc then likesCount desc
    // Our API supports single sortBy; we prefer viewsCount currently
    return { sortBy: 'viewsCount', order: 'desc' }
  }
}

export const FEED_FILTERS: Record<FeedFilterKey, FeedFilterStrategy> = {
  latest: new LatestFilter(),
  popular: new PopularFilter(),
  trending: new TrendingFilter(),
}


