import axios from 'axios'

// Mock 모드 설정 (Backend 연동 전까지 true)
const USE_MOCK = true

// API 기본 설정
const api = axios.create({
  baseURL: '/api',
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json'
  }
})

/**
 * [Interface A] 프로젝트 설정 저장
 * @param {Object} project - 프로젝트 정보
 * @param {string} project.project_id - 프로젝트 ID
 * @param {string} project.project_name - 프로젝트 이름
 * @param {Object} project.db_config - DB 접속 정보
 */
export async function saveProject(project) {
  // Mock 모드
  if (USE_MOCK) {
    console.log('[Mock] saveProject:', project)
    return {
      status: 'success',
      message: '프로젝트 DB 설정이 완료되었습니다. (Mock)',
      project_id: project.project_id
    }
  }

  const response = await api.post('/projects', project)
  return response.data
}

/**
 * [Interface B] 쿼리 변환 요청
 * @param {Object} data - 변환 요청 데이터
 * @param {string} data.project_id - 프로젝트 ID
 * @param {string} data.xml_file_name - XML 파일명
 * @param {string} data.mapper_namespace - 네임스페이스
 * @param {string} data.file_created_at - 생성 일시
 * @param {Array} data.queries - 쿼리 배열
 */
export async function convertQueries(data) {
  // Mock 모드
  if (USE_MOCK) {
    console.log('[Mock] convertQueries:', data)
    return generateMockResponse(data)
  }

  const response = await api.post('/convert', data)
  return response.data
}

/**
 * Mock 응답 생성 (Backend 연동 전 개발용)
 */
function generateMockResponse(data) {
  const mockQueries = data.queries.map(query => ({
    query_id: query.query_id,
    tag_name: query.tag_name,
    attributes: query.attributes,
    original_sql_xml: query.original_sql_xml,
    difficulty_level: Math.floor(Math.random() * 3) + 1,
    converted_sql: convertMockSql(query.original_sql_xml),
    conversion_log: generateMockLog(query.original_sql_xml),
    dry_run_result: {
      is_success: Math.random() > 0.2,
      explain_plan: 'Hash Left Join (cost=10.20..45.12 rows=100 width=32)',
      error_message: null
    },
    ai_guide_report: 'DDL을 분석하여 최적의 JOIN 구조로 변환했습니다. NVL 함수를 COALESCE로 대체하였으며, Oracle 특유의 (+) 조인 문법을 표준 LEFT OUTER JOIN으로 변환했습니다.'
  }))

  return {
    project_id: data.project_id,
    queries: mockQueries
  }
}

/**
 * Mock SQL 변환
 */
function convertMockSql(originalSql) {
  let converted = originalSql
  converted = converted.replace(/SYSDATE/gi, 'CURRENT_TIMESTAMP')
  converted = converted.replace(/NVL\(/gi, 'COALESCE(')
  converted = converted.replace(/DECODE\(/gi, 'CASE WHEN ')
  converted = converted.replace(/\(\+\)/g, '') // Oracle outer join 제거
  return converted
}

/**
 * Mock 변환 로그 생성
 */
function generateMockLog(originalSql) {
  const logs = []

  if (/SYSDATE/i.test(originalSql)) {
    logs.push({ category: 'FUNCTION', before: 'SYSDATE', after: 'CURRENT_TIMESTAMP' })
  }
  if (/NVL\(/i.test(originalSql)) {
    logs.push({ category: 'FUNCTION', before: 'NVL', after: 'COALESCE' })
  }
  if (/DECODE\(/i.test(originalSql)) {
    logs.push({ category: 'FUNCTION', before: 'DECODE', after: 'CASE WHEN' })
  }
  if (/\(\+\)/.test(originalSql)) {
    logs.push({ category: 'JOIN', before: '(+)', after: 'LEFT OUTER JOIN' })
  }

  return logs
}

export default api
