/**
 * 환경 변수 검증 유틸리티
 * 
 * 필수 환경 변수가 설정되어 있는지 확인하고,
 * 개발 환경에서 누락된 환경 변수를 경고합니다.
 */

// 필수 환경 변수 목록
const REQUIRED_ENV_VARS = {
  // API 설정
  'NEXT_PUBLIC_API_URL': '백엔드 API URL',
  'NEXT_PUBLIC_APP_NAME': '애플리케이션 이름',
  
  // 인증 설정
  'NEXTAUTH_URL': 'NextAuth.js URL',
  'NEXTAUTH_SECRET': 'NextAuth.js 시크릿 키',
  
  // 데이터베이스 설정
  'DATABASE_URL': '데이터베이스 연결 URL',
  
  // 외부 API 키
  'OPENAI_API_KEY': 'OpenAI API 키',
  'NEWS_API_KEY': '뉴스 API 키',
  'WEATHER_API_KEY': '날씨 API 키',
  
  // 카카오 API 설정
  'NEXT_PUBLIC_KAKAO_JS_KEY': '카카오 JavaScript 키',
  'NEXT_PUBLIC_KAKAO_TEMPLATE_ID': '카카오 템플릿 ID',
  'KAKAO_REST_API_KEY': '카카오 REST API 키',
  
  // 이메일 설정
  'SMTP_HOST': 'SMTP 서버 호스트',
  'SMTP_PORT': 'SMTP 서버 포트',
  'SMTP_USER': 'SMTP 사용자명',
  'SMTP_PASS': 'SMTP 비밀번호',
  
  // 로깅 설정
  'LOG_LEVEL': '로그 레벨',
  'NODE_ENV': 'Node.js 환경'
};

// 선택적 환경 변수 목록
const OPTIONAL_ENV_VARS = {
  'NEXT_PUBLIC_DEBUG': '디버그 모드',
  'NEXT_PUBLIC_ANALYTICS_ID': '분석 ID',
  'REDIS_URL': 'Redis 연결 URL',
  'SENTRY_DSN': 'Sentry DSN'
};

/**
 * 환경 변수 검증
 * @param {boolean} strict - 엄격 모드 (true면 누락된 변수로 인해 에러 발생)
 * @returns {Object} 검증 결과
 */
function validateEnvVars(strict = false) {
  const missing = [];
  const warnings = [];
  const valid = [];
  
  // 필수 환경 변수 검증
  Object.entries(REQUIRED_ENV_VARS).forEach(([key, description]) => {
    if (!process.env[key]) {
      missing.push({ key, description });
    } else {
      valid.push({ key, description, value: maskValue(process.env[key]) });
    }
  });
  
  // 선택적 환경 변수 검증
  Object.entries(OPTIONAL_ENV_VARS).forEach(([key, description]) => {
    if (!process.env[key]) {
      warnings.push({ key, description });
    } else {
      valid.push({ key, description, value: maskValue(process.env[key]) });
    }
  });
  
  // 결과 반환
  const result = {
    isValid: missing.length === 0,
    missing,
    warnings,
    valid,
    total: Object.keys(REQUIRED_ENV_VARS).length + Object.keys(OPTIONAL_ENV_VARS).length,
    required: Object.keys(REQUIRED_ENV_VARS).length,
    optional: Object.keys(OPTIONAL_ENV_VARS).length
  };
  
  // 엄격 모드에서 누락된 변수가 있으면 에러 발생
  if (strict && missing.length > 0) {
    throw new Error(`필수 환경 변수가 누락되었습니다: ${missing.map(m => m.key).join(', ')}`);
  }
  
  return result;
}

/**
 * 민감한 값 마스킹
 * @param {string} value - 마스킹할 값
 * @returns {string} 마스킹된 값
 */
function maskValue(value) {
  if (!value) return '';
  
  // URL인 경우 도메인만 표시
  if (value.startsWith('http')) {
    try {
      const url = new URL(value);
      return `${url.protocol}//${url.hostname}${url.pathname}`;
    } catch {
      return '***';
    }
  }
  
  // API 키나 시크릿인 경우 마스킹
  if (value.includes('key') || value.includes('secret') || value.includes('token')) {
    if (value.length > 8) {
      return `${value.substring(0, 4)}***${value.substring(value.length - 4)}`;
    }
    return '***';
  }
  
  // 비밀번호인 경우 마스킹
  if (value.includes('pass') || value.includes('pwd')) {
    return '***';
  }
  
  return value;
}

/**
 * 환경 변수 검증 결과 출력
 * @param {Object} result - validateEnvVars의 결과
 */
function printValidationResult(result) {
  console.log('\n🌍 환경 변수 검증 결과');
  console.log('========================');
  
  if (result.isValid) {
    console.log('✅ 모든 필수 환경 변수가 설정되었습니다!');
  } else {
    console.log('❌ 누락된 필수 환경 변수가 있습니다:');
    result.missing.forEach(({ key, description }) => {
      console.log(`   - ${key}: ${description}`);
    });
  }
  
  if (result.warnings.length > 0) {
    console.log('\n⚠️  선택적 환경 변수 (설정 권장):');
    result.warnings.forEach(({ key, description }) => {
      console.log(`   - ${key}: ${description}`);
    });
  }
  
  console.log(`\n📊 통계:`);
  console.log(`   - 총 환경 변수: ${result.total}`);
  console.log(`   - 필수: ${result.required}`);
  console.log(`   - 선택: ${result.optional}`);
  console.log(`   - 설정됨: ${result.valid.length}`);
  console.log(`   - 누락됨: ${result.missing.length}`);
  console.log(`   - 경고: ${result.warnings.length}`);
  
  if (result.valid.length > 0) {
    console.log('\n✅ 설정된 환경 변수:');
    result.valid.forEach(({ key, description, value }) => {
      console.log(`   - ${key}: ${value} (${description})`);
    });
  }
}

/**
 * 개발 환경에서 환경 변수 검증 실행
 */
function validateEnvInDevelopment() {
  if (process.env.NODE_ENV === 'development') {
    try {
      const result = validateEnvVars(false); // 엄격하지 않은 모드
      printValidationResult(result);
      
      if (!result.isValid) {
        console.log('\n💡 해결 방법:');
        console.log('1. npm run setup:env:local 명령어로 환경 변수 파일을 생성하세요');
        console.log('2. ENV_SETUP.md 파일을 참고하여 누락된 변수를 설정하세요');
        console.log('3. .env.local 파일에 실제 API 키와 설정을 입력하세요');
      }
    } catch (error) {
      console.error('환경 변수 검증 중 오류가 발생했습니다:', error.message);
    }
  }
}

/**
 * 환경 변수 타입 검증
 * @param {string} key - 환경 변수 키
 * @param {string} expectedType - 예상 타입 ('string', 'number', 'boolean', 'url')
 * @returns {boolean} 타입이 올바른지 여부
 */
function validateEnvVarType(key, expectedType) {
  const value = process.env[key];
  if (!value) return false;
  
  switch (expectedType) {
    case 'string':
      return typeof value === 'string';
    case 'number':
      return !isNaN(Number(value));
    case 'boolean':
      return ['true', 'false', '1', '0'].includes(value.toLowerCase());
    case 'url':
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    default:
      return true;
  }
}

module.exports = {
  validateEnvVars,
  validateEnvVarType,
  printValidationResult,
  validateEnvInDevelopment,
  REQUIRED_ENV_VARS,
  OPTIONAL_ENV_VARS
};
