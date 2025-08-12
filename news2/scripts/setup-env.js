#!/usr/bin/env node

/**
 * 환경 변수 설정 자동화 스크립트
 * 
 * 사용법:
 * node scripts/setup-env.js local
 * node scripts/setup-env.js development
 * node scripts/setup-env.js production
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// 색상 코드
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// 로그 함수
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// 강력한 시크릿 키 생성
function generateSecretKey() {
  return crypto.randomBytes(32).toString('hex');
}

// 환경별 설정 템플릿
const envTemplates = {
  local: {
    filename: '.env.local',
    content: `# 로컬 개발용 환경 변수
# API 설정
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=NewSphere

# 인증 설정
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=${generateSecretKey()}

# 데이터베이스 설정 (로컬)
DATABASE_URL=postgresql://localhost:5432/newsphere_local

# 외부 API 키 (로컬 개발용)
OPENAI_API_KEY=your-openai-api-key-here
NEWS_API_KEY=your-news-api-key-here
WEATHER_API_KEY=your-weather-api-key-here

# 이메일 설정 (로컬)
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_USER=test@example.com
SMTP_PASS=test-password

# 로깅 설정
LOG_LEVEL=debug
NODE_ENV=development
`
  },
  development: {
    filename: '.env.development',
    content: `# 개발 서버용 환경 변수
# API 설정
NEXT_PUBLIC_API_URL=https://dev-api.example.com
NEXT_PUBLIC_APP_NAME=NewSphere (Dev)

# 인증 설정
NEXTAUTH_URL=https://dev.newsphere.com
NEXTAUTH_SECRET=${generateSecretKey()}

# 데이터베이스 설정 (개발)
DATABASE_URL=postgresql://dev-user:dev-pass@dev-db:5432/newsphere_dev

# 외부 API 키 (개발용)
OPENAI_API_KEY=dev-openai-api-key
NEWS_API_KEY=dev-news-api-key
WEATHER_API_KEY=dev-weather-api-key

# 이메일 설정 (개발)
SMTP_HOST=dev-smtp.example.com
SMTP_PORT=587
SMTP_USER=dev@newsphere.com
SMTP_PASS=dev-smtp-password

# 로깅 설정
LOG_LEVEL=info
NODE_ENV=development
`
  },
  production: {
    filename: '.env.production',
    content: `# 운영 서버용 환경 변수
# API 설정
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_APP_NAME=NewSphere

# 인증 설정
NEXTAUTH_URL=https://newsphere.com
NEXTAUTH_SECRET=${generateSecretKey()}

# 데이터베이스 설정 (운영)
DATABASE_URL=postgresql://prod-user:prod-pass@prod-db:5432/newsphere_prod

# 외부 API 키 (운영용)
OPENAI_API_KEY=prod-openai-api-key
NEWS_API_KEY=prod-news-api-key
WEATHER_API_KEY=prod-weather-api-key

# 이메일 설정 (운영)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=noreply@newsphere.com
SMTP_PASS=prod-smtp-password

# 로깅 설정
LOG_LEVEL=warn
NODE_ENV=production
`
  }
};

// 환경 변수 파일 생성
function createEnvFile(environment) {
  const template = envTemplates[environment];
  if (!template) {
    log(`❌ 지원하지 않는 환경입니다: ${environment}`, 'red');
    log('지원하는 환경: local, development, production', 'yellow');
    process.exit(1);
  }

  const filePath = path.join(process.cwd(), template.filename);
  
  // 파일이 이미 존재하는지 확인
  if (fs.existsSync(filePath)) {
    log(`⚠️  ${template.filename} 파일이 이미 존재합니다.`, 'yellow');
    const answer = require('readline-sync').question('덮어쓰시겠습니까? (y/N): ');
    if (answer.toLowerCase() !== 'y') {
      log('❌ 파일 생성이 취소되었습니다.', 'red');
      process.exit(0);
    }
  }

  try {
    fs.writeFileSync(filePath, template.content);
    
    // 파일 권한 설정 (Unix/Linux/macOS)
    if (process.platform !== 'win32') {
      fs.chmodSync(filePath, 0o600);
    }
    
    log(`✅ ${template.filename} 파일이 성공적으로 생성되었습니다!`, 'green');
    log(`📁 파일 위치: ${filePath}`, 'cyan');
    
    if (environment === 'local') {
      log('\n🔧 다음 단계:', 'bright');
      log('1. API 키들을 실제 값으로 변경하세요', 'yellow');
      log('2. 데이터베이스 연결 정보를 확인하세요', 'yellow');
      log('3. 이메일 설정을 확인하세요', 'yellow');
      log('4. npm run dev로 개발 서버를 시작하세요', 'yellow');
    }
    
  } catch (error) {
    log(`❌ 파일 생성 중 오류가 발생했습니다: ${error.message}`, 'red');
    process.exit(1);
  }
}

// 메인 함수
function main() {
  const args = process.argv.slice(2);
  const environment = args[0];

  log('🌍 NewSphere 환경 변수 설정 도구', 'bright');
  log('=====================================', 'cyan');

  if (!environment) {
    log('❌ 환경을 지정해주세요.', 'red');
    log('\n사용법:', 'bright');
    log('  node scripts/setup-env.js local', 'cyan');
    log('  node scripts/setup-env.js development', 'cyan');
    log('  node scripts/setup-env.js production', 'cyan');
    log('\n환경 설명:', 'bright');
    log('  local       - 로컬 개발용 (.env.local)', 'yellow');
    log('  development - 개발 서버용 (.env.development)', 'yellow');
    log('  production  - 운영 서버용 (.env.production)', 'yellow');
    process.exit(1);
  }

  createEnvFile(environment);
}

// 스크립트 실행
if (require.main === module) {
  main();
}

module.exports = { createEnvFile, generateSecretKey };
