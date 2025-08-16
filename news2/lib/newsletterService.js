// 뉴스레터 관련 API 서비스
export const newsletterService = {
  // 뉴스레터 목록 조회
  async getNewsletters() {
    try {
      const response = await fetch('/api/newsletters', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('뉴스레터 목록 조회 실패:', error)
      throw error
    }
  },

  // 뉴스레터 구독
  async subscribeNewsletter(newsletterId, email) {
    try {
      const response = await fetch('/api/newsletters/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newsletterId,
          email,
        }),
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('뉴스레터 구독 실패:', error)
      throw error
    }
  },

  // 뉴스레터 구독 해제
  async unsubscribeNewsletter(newsletterId) {
    try {
      const response = await fetch('/api/newsletters/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newsletterId,
        }),
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('뉴스레터 구독 해제 실패:', error)
      throw error
    }
  },

  // 사용자 구독 목록 조회
  async getUserSubscriptions() {
    try {
      const response = await fetch('/api/newsletters/user-subscriptions', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('사용자 구독 목록 조회 실패:', error)
      throw error
    }
  },
}
