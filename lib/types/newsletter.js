/**
 * 뉴스레터 콘텐츠 DTO 구조
 * 서버에서 개인화된 뉴스레터 콘텐츠를 생성할 때 사용
 */

/**
 * 백엔드 뉴스레터 데이터 구조
 */
export class BackendNewsletter {
  constructor(data = {}) {
    this.id = data.id || null
    this.title = data.title || data.name || ""
    this.description = data.description || data.summary || ""
    this.category = data.category || ""
    this.frequency = data.frequency || data.schedule || ""
    this.subscriberCount = data.subscriberCount || data.subscribers || 0
    this.lastSentAt = data.lastSentAt || data.updatedAt || null
    this.tags = data.tags || data.keywords || []
    this.isSubscribed = data.isSubscribed || false
    this.createdAt = data.createdAt || null
    this.updatedAt = data.updatedAt || null
  }

  /**
   * 프론트엔드 형식으로 변환
   */
  toFrontend() {
    const categoryMapping = {
      'POLITICS': '정치',
      'ECONOMY': '경제', 
      'SOCIETY': '사회',
      'LIFE': '생활',
      'INTERNATIONAL': '세계',
      'IT_SCIENCE': 'IT/과학',
      'VEHICLE': '자동차/교통',
      'TRAVEL_FOOD': '여행/음식',
      'ART': '예술'
    };

    return {
      id: this.id,
      title: this.title,
      description: this.description,
      category: categoryMapping[this.category] || this.category,
      frequency: this.frequency,
      subscribers: this.subscriberCount,
      lastSent: this.formatTimeAgo(),
      tags: this.tags,
      isSubscribed: this.isSubscribed,
      _backendData: this
    };
  }

  /**
   * 시간 포맷팅
   */
  formatTimeAgo() {
    if (!this.lastSentAt) return '최근';
    
    const now = new Date();
    const date = new Date(this.lastSentAt);
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}분 전`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}시간 전`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}일 전`;
    }
  }
}

/**
 * 백엔드 구독 데이터 구조
 */
export class BackendSubscription {
  constructor(data = {}) {
    this.id = data.id || null
    this.category = data.category || ""
    this.status = data.status || "ACTIVE"
    this.createdAt = data.createdAt || null
    this.updatedAt = data.updatedAt || null
    this.preferredCategories = data.preferredCategories || []
  }

  /**
   * 프론트엔드 형식으로 변환
   */
  toFrontend() {
    const categoryMapping = {
      'POLITICS': '정치',
      'ECONOMY': '경제', 
      'SOCIETY': '사회',
      'LIFE': '생활',
      'INTERNATIONAL': '세계',
      'IT_SCIENCE': 'IT/과학',
      'VEHICLE': '자동차/교통',
      'TRAVEL_FOOD': '여행/음식',
      'ART': '예술'
    };

    return {
      id: this.id,
      category: categoryMapping[this.category] || this.category,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      preferredCategories: this.preferredCategories.map(cat => 
        categoryMapping[cat] || cat
      ),
      _backendData: this
    };
  }
}

/**
 * 뉴스레터 기사 정보
 */
export class NewsletterArticle {
  constructor(data = {}) {
    this.id = data.id || null
    this.title = data.title || ""
    this.summary = data.summary || ""
    this.category = data.category || ""
    this.url = data.url || ""
    this.publishedAt = data.publishedAt || ""
    this.image = data.image || ""
    this.readTime = data.readTime || "3분"
    this.source = data.source || ""
    this.author = data.author || ""
  }

  static fromNewsItem(newsItem) {
    return new NewsletterArticle({
      id: newsItem.id,
      title: newsItem.title,
      summary: newsItem.summary,
      category: newsItem.category,
      url: newsItem.link || `/news/${newsItem.id}`,
      publishedAt: newsItem.publishedAt,
      image: newsItem.image,
      source: newsItem.source,
      author: newsItem.author
    })
  }
}

/**
 * 뉴스레터 섹션 정보
 */
export class NewsletterSection {
  constructor(data = {}) {
    this.heading = data.heading || ""
    this.subtitle = data.subtitle || ""
    this.items = data.items || []
    this.type = data.type || "article" // "article", "header", "summary"
  }

  static createHeader(heading, subtitle = "") {
    return new NewsletterSection({
      heading,
      subtitle,
      type: "header"
    })
  }

  static createArticleSection(heading, articles) {
    return new NewsletterSection({
      heading,
      items: articles.map(article => 
        article instanceof NewsletterArticle ? article : new NewsletterArticle(article)
      ),
      type: "article"
    })
  }
}

/**
 * 뉴스레터 콘텐츠 메인 DTO
 */
export class NewsletterContent {
  constructor(data = {}) {
    this.id = data.id || null
    this.title = data.title || ""
    this.description = data.description || ""
    this.category = data.category || ""
    this.personalized = data.personalized || false
    this.sections = data.sections || []
    this.tags = data.tags || []
    this.footer = data.footer || {
      unsubscribe: "구독 해지",
      preferences: "설정 변경", 
      contact: "문의하기"
    }
    this.metadata = data.metadata || {
      generatedAt: new Date().toISOString(),
      version: "1.0"
    }
  }

  /**
   * 섹션 추가
   */
  addSection(section) {
    if (section instanceof NewsletterSection) {
      this.sections.push(section)
    } else {
      this.sections.push(new NewsletterSection(section))
    }
    return this
  }

  /**
   * 기사 섹션 추가
   */
  addArticleSection(heading, articles) {
    return this.addSection(NewsletterSection.createArticleSection(heading, articles))
  }

  /**
   * 헤더 섹션 추가
   */
  addHeaderSection(heading, subtitle = "") {
    return this.addSection(NewsletterSection.createHeader(heading, subtitle))
  }

  /**
   * JSON으로 직렬화
   */
  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      category: this.category,
      personalized: this.personalized,
      sections: this.sections.map(section => ({
        heading: section.heading,
        subtitle: section.subtitle,
        type: section.type,
        items: section.items.map(item => ({
          id: item.id,
          title: item.title,
          summary: item.summary,
          category: item.category,
          url: item.url,
          publishedAt: item.publishedAt,
          image: item.image,
          readTime: item.readTime,
          source: item.source,
          author: item.author
        }))
      })),
      tags: this.tags,
      footer: this.footer,
      metadata: this.metadata
    }
  }

  /**
   * JSON에서 역직렬화
   */
  static fromJSON(json) {
    const content = new NewsletterContent(json)
    content.sections = json.sections?.map(sectionData => {
      const section = new NewsletterSection(sectionData)
      section.items = sectionData.items?.map(itemData => new NewsletterArticle(itemData)) || []
      return section
    }) || []
    return content
  }
}
