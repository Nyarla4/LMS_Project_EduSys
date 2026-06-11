### 개발 규칙
* **본인 이름에 맞는 브랜치 사용:** 수정, 커밋 후 dev 브랜치에 머지
* **진행 전 머지:** 본인 작업 진행하기 전 dev 브랜치에서 머지받아오고 진행

### 개발 환경
* **프론트 엔드 작업:** lms_front\app 아래에 작업 폴더 생성 후 page.tsx 작성해서 진행
```
cd .\lms_front\
npm install
```
해서 nextjs에서 필요한 모듈 설치 후 npm run dev로 실행
* **백 엔드 작업:** 솔직히 저도 잘은 모릅니다 지원님한테 문의해주시면 감사하겠습니다(프론트랑 연동하는 부분)
# 🎓 EduSys: Learning Management System

> **EduSys**는 교육자와 학습자 사이의 효율적인 지식 전달을 위해 설계된 학생 중심의 학습 관리 시스템(LMS)입니다.

## 📖 프로젝트 개요
EduSys는 강사가 제공하는 다양한 교육 콘텐츠(영상, 과제, 시험)를 체계적인 시퀀스로 구성하고, 학생들이 이를 순차적으로 학습하며 성취도를 높일 수 있도록 돕는 플랫폼입니다. 

## ✨ 핵심 기능 (Key Features)

### 1. 강사 매니지먼트 (Instructor Workflow)
* **교육 개체 업로드:** - 강의 영상(Video) 등록 및 관리
  - 학습 평가를 위한 과제(Assignment) 출제
  - 성취도 측정을 위한 온라인 시험(Exam) 생성
* **학습 시퀀스 설계:** 업로드된 개체들을 조합하여 학생들에게 제공할 최적화된 커리큘럼 구성

### 2. 학생 학습 경험 (Student Experience)
* **학습 시퀀스 이행:** 강사가 설정한 흐름에 따라 영상 시청, 과제 제출, 시험 응시를 진행하는 인터랙티브 학습 경로
* **학습 상태 추적:** 개인별 진도율 및 학습 결과에 대한 실시간 피드백 확인


### db 처리

1. MySQL Workbench의 접속 정보를 `\LMS_Project_EduSys\edusys\src\main\resources\application.properties`의 MySQL 연결 설정에 기입
2. 해당 연결에서 이하 쿼리 처리
```sql
-- 1. 데이터베이스 생성
CREATE DATABASE edusys_db;

-- 2. 공통 사용자 생성 (GitHub 협업용)
CREATE USER 'edusys_user'@'localhost' IDENTIFIED BY 'edusys_pw';

-- 3. 권한 부여
GRANT ALL PRIVILEGES ON edusys_db.* TO 'edusys_user'@'localhost';
FLUSH PRIVILEGES;
```

## 통합CSS 구성(페이지 별 사이즈 조절 필요)

### 1. 전체 영역
```jsx
<div className="min-h-screen bg-[#f5f1e8] border-[#d6c2a8] border-2 rounded-lg flex justify-center py-10">
```

### 2. 내부 전체 영역
```jsx
<div className="w-full max-w-6xl flex gap-6 mt-10 px-10">
```

### 3. 내부 영역 박스(필요시)
```jsx
<div className="bg-[#fcf7f0] border-[#b89b7a] border-1 rounded-lg p-3 shadow-sm font-bold">
```

### 4. 큰 제목
```jsx
<p className="text-4xl font-bold text-center mb-4 bg-[#e7d7c1] border-[#d6c2a8] border-2 rounded-full py-2">
```

### 5. 선택 버튼
```jsx
<button
  type="button"
  className={`px-3 py-1 rounded text-sm border-[#b89b7a] border-1 font-bold ${
    selectedCategory === "선택 버튼"
      ? "bg-[#8b5e3c] text-white"
      : "bg-[#dbc7b1] text-[#5c4033]"
  }`}>
```

### 6. 일반 버튼
```jsx
<button
  type="button"
  className="bg-[#8b5e3c] hover:bg-[#6f4a2f] text-white px-3 py-2 rounded text-lg mx-auto block mt-2">
```

### 7. 라벨 폼
```jsx
<label className="text-xl font-bold">라벨</label>
<input type="text" className="border-[#b89b7a] border-1 rounded px-3 py-2"/>
```

## AI 서비스 (FastAPI) 로컬 환경 가이드

본 프로젝트는 강사의 시험 문제 출제 편의성 개선 및 주관식 채점 보조를 위해 로컬 LLM(Ollama) 및 오픈소스 Vector DB(ChromaDB)를 연동한 RAG 시스템을 내장하고 있습니다.
로컬 데이터베이스 데이터 유실 방지와 협업 시 충돌 예방을 위해 다음 구동 가이드를 따라주세요.

### 1. 사전 요구사항 (Pre-requisites)

**Python**: 3.10 버전 이상 설치 필수

**Ollama 엔진**: Ollama 공식 홈페이지에서 각 OS 버전에 맞는 클라이언트를 설치 및 실행합니다.

**추론용 LLM 모델 로드**: 터미널(CMD 또는 PowerShell)을 열고 아래 명령어를 실행하여 고효율 한국어 지원 모델을 내려받습니다.

```base
ollama run qwen2.5:3b
```

### 2. 가상환경 구성 및 패키지 설치

ai 디렉토리 하위의 독립된 파이썬 가상환경을 구축하고 개선된 의존성 일람을 전역 복원합니다.

```base
cd ai
python -m venv venv

# 가상환경 활성화 (Windows PowerShell)
.\venv\Scripts\Activate.ps1

# 가상환경 활성화 (macOS / Linux)
source venv/bin/activate

# 필수 패키지 일괄 설치 (FastAPI, ChromaDB, SentenceTransformers, PyMySQL 포함)
pip install -r requirements.txt
```

### 3. 로컬 Vector DB 구축 및 초기화 (최초 1회 필수)

Git 추적에서 제외된 chroma_data를 각자의 로컬 MySQL 데이터에 맞춰 동적으로 생성하는 단계입니다.

1. ai/init_vector_db.py 파일을 열어 상단의 DB_CONFIG 접속 정보를 본인의 로컬 MySQL 접속 정보(계정, 비밀번호, DB명)에 맞게 확인합니다.

2. 가상환경이 활성화된 상태에서 아래 스크립트를 최초 1회 실행합니다.

```base
python init_vector_db.py
```

(스크립트가 로컬 DB에 적재된 강의 영상 경로를 추적하여 자막을 추출한 뒤, 로컬 경로인 ai/chroma_data/ 하위에 임베딩 벡터 연산 저장을 자동으로 처리합니다.)

### 4. AI API 서버 구동

Spring Boot 백엔드 및 Next.js 프론트엔드와 실시간 API 통신을 수행할 파이썬 API 서버를 기동합니다.

```base
uvicorn main:app --reload --port 8000
```
