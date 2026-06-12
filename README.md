# EduSys: Learning Management System

<!-- > **발표 바로가기:** [AA (Frontend)](./AA/README.md) | [TA (Backend)](./TA/README.md) | [SA (AI Pipeline)](./SA/README.md) -->

**EduSys**는 교육자와 학습자 사이의 효율적인 지식 전달을 위해 설계된 학생 중심의 학습 관리 시스템(LMS)입니다.

EduSys는 강사가 제공하는 다양한 교육 콘텐츠(영상, 과제, 시험)를 체계적인 시퀀스로 구성하고,

학생들이 이를 순차적으로 학습하며 성취도를 높일 수 있도록 돕는 플랫폼입니다. 

본 프로젝트는 **AWS 기반 MSA 구조**, **Docker 컨테이너**, **CI/CD 자동 배포**, **Blue-Green / Rolling Update 배포 전략**을 적용하여 실제 서비스 운영 환경과 유사한 아키텍처를 목표로 설계되었습니다.

---

# 프로젝트 개요

| 항목 | 내용 |
|---|---|
| 프로젝트명 | Edusys |
| 서비스명 | Edusys |
| 기간 | 6주 |
| 인원 | 4명 |
| 아키텍처 | MSA 기반 서비스 분리 |
| 클라우드 | AWS |
| 컨테이너 | Docker |
| 배포 | ECS Fargate |
| CI/CD | GitHub Actions |
| 배포 전략 | Blue-Green (FE/BE), Rolling Update (SA) |

---

# 핵심 기능

## 1️⃣ 강사 매니지먼트 (Instructor Workflow)
* **교육 개체 업로드:** - 강의 영상(Video) 등록 및 관리
  - 학습 평가를 위한 과제(Assignment) 출제
  - 성취도 측정을 위한 온라인 시험(Exam) 생성
* **학습 시퀀스 설계:** 업로드된 개체들을 조합하여 학생들에게 제공할 최적화된 커리큘럼 구성

## 2️⃣ 학생 학습 경험 (Student Experience)
* **학습 시퀀스 이행:** 강사가 설정한 흐름에 따라 영상 시청, 과제 제출, 시험 응시를 진행하는 인터랙티브 학습 경로
* **학습 상태 추적:** 개인별 진도율 및 학습 결과에 대한 실시간 피드백 확인

---

# 전체 시스템 아키텍처
![전체 시스템 아키텍처](./systemflow.png)

---

# 서비스 처리 흐름

1. 사용자가 회의 녹음 파일 업로드
2. Core API가 **S3 Presigned URL 발급**
3. 파일이 **S3에 업로드**
4. AI Processing Service가 S3에서 파일 읽기
5. **AWS Transcribe → 음성 텍스트 변환**
6. **Amazon Bedrock → 회의 요약 생성**
7. **Amazon Bedrock → 개인별 To-Do 추출**
8. 결과 데이터를 **RDS 저장**
9. 사용자는 아카이브 페이지에서 회의 기록 조회

---

# 기술 스택

## Frontend
- Next.js
- tailwind
- Vanilla JavaScript

## Backend
- Spring Boot

## AI
- ollama
- Fast API

## Database
- MySql

---

# 역할 분담

## TA – Core API & Database → [상세 보기](./TA/README.md)

- Meeting 생성 API
- 상태 관리 API
- AI 처리 트리거
- DB 설계 및 관리
- Core API Docker 구성
- Core API CI/CD 구성

---

## SA – AI Processing Service → [상세 보기](./SA/README.md)

- AWS Transcribe(STT) 음성→텍스트 변환
- Amazon Bedrock (Claude 3.5 Sonnet) 요약 생성
- 개인별 To-Do 자동 추출 로직
- SQS 비동기 롱 폴링(Long Polling) 처리
- AI Service Docker 구성 (python:3.12-slim)
- AI Service CI/CD 구성 (OIDC + Rolling Update)

---

## AA – Frontend & Archive API → [상세 보기](./AA/README.md)

- 파일 업로드 UI
- 회의 상세 페이지
- To-Do 카드 UI
- Archive 조회 API
- Frontend Docker 구성
- Frontend CI/CD 구성

---

# DevOps 구성

## Docker

각 서비스는 독립적인 Docker 이미지로 구성됩니다.

- frontend Dockerfile
- core-api Dockerfile
- ai-service Dockerfile

Docker 이미지는 **AWS ECR**에 저장됩니다.

---

## CI/CD

GitHub Actions를 이용하여 자동 배포 파이프라인을 구성합니다.

1. 코드 Push
2. Docker Image Build
3. AWS ECR Push
4. ECS 서비스 업데이트
5. Blue-Green (FE/BE) / Rolling Update (SA) 배포

---

# 모니터링

운영 모니터링은 **AWS CloudWatch**를 사용합니다.

- 서비스 로그 수집
- 에러 로그 확인
- 서비스 상태 모니터링
- 장애 대응 알람

---

# 프로젝트 목표

본 프로젝트는 단순 기능 구현을 넘어서 다음을 목표로 합니다.

- AWS 기반 **MSA 아키텍처 경험**
- Docker 기반 **컨테이너 서비스 운영**
- GitHub Actions 기반 **CI/CD 자동화**
- ECS 기반 **클라우드 서비스 배포 경험**
- 실제 서비스 수준의 **아키텍처 설계 경험**

---

# 파트별 상세 문서

| 순서 | 파트 | 담당 | 바로가기 |
|:---:|---|---|---|
| 1 | **AA** – Frontend & UI | 선영 | [프론트엔드 발표 자료](./AA/README.md) |
| 2 | **TA** – Core API & Database | 단비 | [백엔드 발표 자료](./TA/README.md) |
| 3 | **SA** – AI Processing Pipeline | 주환 | [AI 파이프라인 발표 자료](./SA/README.md) |