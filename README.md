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

## 🏗️ 설계 철학 (Design Philosophy)
본 프로젝트는 시스템의 안정성과 확장성을 위해 **구조(Structure)**와 **흐름(Flow)**의 명확한 분리를 핵심 원칙으로 삼습니다.
* **구조 (Structure):** 객체의 역할과 책임, 의존 관계를 실행 환경과 독립적으로 정의하여 견고한 설계 프레임워크를 구축합니다.
* **흐름 (Flow):** 구체적인 처리 과정과 비즈니스 로직은 메서드 내부에 캡슐화하여, 실행 중에 구조적 결정이 섞이지 않도록 관리합니다.

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