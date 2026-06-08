from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
from youtube_transcript_api import YouTubeTranscriptApi
import chromadb
import ollama
import json
import re
from datetime import date

app = FastAPI()

# ==========================================
# [구조화] 공통 자원 초기화 (서버 기동 시 1회 실행)
# ==========================================
print("로컬 AI 모델 및 DB 초기화 중...")
model = SentenceTransformer('intfloat/multilingual-e5-small')
client = chromadb.PersistentClient(path="./chroma_data")
collection = client.get_or_create_collection(name="lecture_transcripts")
print("초기화 완료.")

# ==========================================
# [구조화] DTO (Data Transfer Object) 정의
# ==========================================
class EmbedRequest(BaseModel):
    subid: int       # 과목 ID
    fileUrl: str     # 유튜브 영상 링크
    lessonDate: str # 강의 일자

class GenerateExamRequest(BaseModel):
    subid: int       # 출제할 과목 ID
    is_objective: bool#주관식/객관식 여부
    examDate: str   # 시험 일자

class GradeRequest(BaseModel):
    question: str          # 문제 내용
    correct_answer: str    # 모범 답안
    student_answer: str    # 학생 제출 답안

class IncorrectNoteRequest(BaseModel):
    question: str          # 문제 내용
    correct_answer: str    # 모범 답안
    student_answer: str    # 학생 제출 답안
    score: int             # 학생 점수 (채점 결과)

class GenerateExamResponse(BaseModel):
    question: str
    objectiveOption1: str = ""
    objectiveOption2: str = ""
    objectiveOption3: str = ""
    objectiveOption4: str = ""
    answer: str  # 필수 필드로 지정하여 null 방지

# ==========================================
# [흐름 1] 데이터 적재 (Lesson 등록 시 호출)
# ==========================================
@app.post("/api/lesson/embed")
def embed_youtube_subtitle(request: EmbedRequest):
    try:
        # 1. URL에서 video_id 추출
        video_id = request.fileUrl
        if "v=" in video_id:
            video_id = video_id.split("v=")[1].split("&")[0]
        elif "youtu.be/" in video_id:
            video_id = video_id.split("youtu.be/")[1].split("?")[0]
        
        # 2. 기존 스크립트(test.py / proto.py) 방식 적용 (인스턴스 생성 후 fetch)
        api = YouTubeTranscriptApi()
        result = api.fetch(video_id, languages=['ko', 'en'])
        
        # 3. 텍스트 청킹 (snippets 및 item.text 구조 반영)
        fullText = []
        currentText = ""
        idx = 0
        snippet_count = len(result.snippets)
        
        for item in result.snippets:
             idx += 1
             currentText += item.text + " "
             if idx >= snippet_count / 10:
                 fullText.append(currentText.strip())
                 currentText = ""
                 idx = 0
                 
        if currentText: 
            fullText.append(currentText.strip())

        # 4. 임베딩 및 Vector DB 저장
        embeddings = model.encode(fullText)
        ids = [f"{request.subid}_{video_id}_{i}" for i in range(len(fullText))]
        metadatas = [{"subid": request.subid, "text": text, "date": request.lessonDate} for text in fullText]

        collection.add(
            documents=fullText,
            embeddings=embeddings.tolist(),
            metadatas=metadatas,
            ids=ids
        )
        return {"status": "success", "message": f"{len(fullText)}개의 텍스트 청크가 저장되었습니다."}

    except Exception as e:
         print(f"[Error in embed_youtube_subtitle]: {str(e)}")
         raise HTTPException(status_code=500, detail=str(e))

# ==========================================
# [흐름 2] 문제 출제 (response_model 추가 및 프롬프트 강화)
# ==========================================
@app.post("/api/exam/generate", response_model=GenerateExamResponse)
def generate_exam(request: GenerateExamRequest):
    query = "시험 출제에 적합한 핵심 개념, 정의, 중요한 설명"
    query_embedding = model.encode(query).tolist()

    # 1. DB 검색 (날짜 필터링을 제외하고 subid로만 검색)
    search_results = collection.query(
        query_embeddings=[query_embedding],
        n_results=10, # 날짜 필터링을 위해 조금 더 넉넉하게 가져옵니다
        where={"subid": request.subid} 
    )
    
    if not search_results['documents'] or not search_results['documents'][0]:
        raise HTTPException(status_code=404, detail="해당 과목의 자막 데이터가 없습니다.")

    # 2. Python에서 날짜 필터링 및 데이터 병합
    filtered_docs = []
    # 문자열 날짜 비교는 Python에서 lexicographical(사전식) 비교가 가능하므로 ISO 형식(YYYY-MM-DD...)에서 유효합니다.
    for doc, meta in zip(search_results['documents'][0], search_results['metadatas'][0]):
        if meta.get("date") and meta["date"] < str(request.examDate):
            filtered_docs.append(doc)
    
    if not filtered_docs:
        raise HTTPException(status_code=404, detail="해당 시험 일자 이전의 강의 데이터가 없습니다.")

    context_text = " ".join(filtered_docs)

    # 2. 역할(System)과 제약사항 정의 (구조화)
    if request.is_objective:
        system_instruction = """당신은 시험 출제자입니다. 제공된 <강의 내용>을 바탕으로 객관식 4지 선다형 문제를 1개 새로 생성하세요.
<강의 내용>의 텍스트를 그대로 복사하여 문제로 출제하지 말고, 핵심 개념을 묻는 질문을 새로 작성해야 합니다.
반드시 아래 JSON 포맷으로만 응답하세요.

{
  "question": "강의 내용을 바탕으로 새로 출제한 객관식 문제 내용",
  "objectiveOption1": "보기1",
  "objectiveOption2": "보기2",
  "objectiveOption3": "보기3",
  "objectiveOption4": "보기4",
  "answer": "정답 번호 (1, 2, 3, 4 중 하나)"
}"""
    else:
        system_instruction = """당신은 시험 출제자입니다. 제공된 <강의 내용>을 바탕으로 단답형 또는 서술형 주관식 문제를 1개 새로 생성하세요.

        [엄격한 제약사항]
        1. "~문제를 설정하였습니다", "~이해할 수 있게 합니다" 같은 출제 의도, 설명, 메타 발언은 "question" 필드에 절대로 포함하지 마세요.
        2. "question"에는 오직 학생이 읽고 답을 작성해야 하는 순수한 '질문 문장'(-에 대해 서술하시오, -는 무엇인가?)만 작성하세요.
        3. 강의 내용에 포함된 인명(예: 롤스)이나 핵심 단어의 오타가 발생하지 않도록 철저히 검증하세요.

        반드시 아래 JSON 포맷으로만 응답하세요.

        {
          "question": "강의 내용을 바탕으로 새로 출제한 주관식 질문 문장",
          "objectiveOption1": "",
          "objectiveOption2": "",
          "objectiveOption3": "",
          "objectiveOption4": "",
          "answer": "주관식 정답 및 모범 답안 문장"
        }"""

    try:
        # 3. Ollama 호출 (System/User 분리 및 format='json' 적용으로 흐름 제어)
        response = ollama.chat(
            model='qwen2.5:3b', 
            messages=[
                {'role': 'system', 'content': system_instruction},
                {'role': 'user', 'content': f"<강의 내용>\n{context_text}"}
            ], 
            options={'temperature': 0.3},
            format='json'  # Ollama 구조적 출력 강제
        )
        
        result_text = response['message']['content'].strip()
        parsed_json = json.loads(result_text)
        
        # 안전장치 및 Key 보정
        if "answer" not in parsed_json:
            for alternative in ["정답", "모범답안", "Answer"]:
                if alternative in parsed_json:
                    parsed_json["answer"] = parsed_json.pop(alternative)
                    break
            else:
                raise KeyError("answer key가 존재하지 않습니다.")
                
        return parsed_json
        
    except (json.JSONDecodeError, KeyError, Exception) as e:
        print(f"[에러 발생 - 원본 응답]: {result_text}")
        raise HTTPException(status_code=500, detail=f"LLM 응답 제어 실패: {str(e)}")
    
# ==========================================
# [흐름 3] 주관식 답안 채점 (단순 LLM 활용)
# ==========================================
@app.post("/api/exam/grade")
def grade_subjective(request: GradeRequest):
    # 1. JSON 출력을 유도하는 프롬프트 작성 (f-string이므로 중괄호 {{ }} 두 번 사용)
    prompt = f"""
    당신은 학생의 주관식 답안을 정밀하고 공정하게 평가하는 전문 채점자입니다.
    문제와 모범 답안을 기준으로 학생의 답안을 비교하여 0점에서 100점 사이의 '정수 점수'와 명확한 '채점 근거'를 작성하세요.
    
    [채점 지침]
    - 키워드 포함 여부, 개념의 정확성, 문장 구성력을 종합적으로 판단하세요.
    - 완벽한 정답은 100점, 미세한 누락은 80~99점, 핵심 오해나 대량 누락은 40~79점, 백지나 엉뚱한 답은 0~39점 범위 내에서 5점 또는 10점 단위로 유연하게 부분 점수를 부여하세요.
    
    응답은 반드시 아래의 JSON 형식과 동일해야 하며, 다른 부연 설명이나 텍스트는 포함하지 마세요.
    {{
        "score": "0에서 100 사이의 정수 점수",
        "reason": "감점 요인 또는 가점 요인을 포함한 구체적인 채점 근거"
    }}

    문제: {request.question}
    모범 답안: {request.correct_answer}
    학생 답안: {request.student_answer}
    """

    # 2. format='json' 옵션을 추가하여 Ollama가 JSON으로만 응답하도록 강제
    response = ollama.chat(
        model='qwen2.5:3b', 
        messages=[{'role': 'user', 'content': prompt}], 
        options={'temperature': 0.0},
        format='json' 
    )
    
    response_text = response['message']['content'].strip()
    
    # 3. JSON 파싱 및 예외 처리
    try:
        result = json.loads(response_text)
        score = int(result.get("score"))
        reason = result.get("reason", "").strip()
    except (json.JSONDecodeError, ValueError, TypeError):
        raise HTTPException(
            status_code=500, 
            detail=f"모델의 응답을 파싱하지 못했습니다. 응답 원문: {response_text}"
        )
    
    # 4. 점수와 근거를 함께 반환
    return {
        "score": score,
        "reason": reason
    }

# ==========================================
# [흐름 4] 오답노트 생성 (LLM 활용 오답 분석 및 피드백)
# ==========================================
@app.post("/api/exam/incorrect-note")
def generate_incorrect_note(request: IncorrectNoteRequest):
    # 1. 100점 만점 기준 및 점수대별 분석 가이드라인을 프롬프트에 명시
    prompt = f"""
    당신은 학생의 성장을 돕는 친절하고 전문적인 학습 멘토입니다.
    제시된 문제, 모범 답안, 학생의 제출 답안, 그리고 채점 점수(100점 만점 기준)를 비교 분석하여 학생을 위한 맞춤형 '오답노트'를 작성하세요.
    
    [점수별 분석 지침 (100점 만점 기준)]
    현재 학생의 획득 점수는 [{request.score}점 / 100점] 입니다. 이 점수를 바탕으로 분석 수준을 조율하세요.
    - 100점: 완벽한 정답입니다. 칭찬과 함께 개념을 완벽히 숙지했음을 격려하고, 리프레시용 핵심 개념만 요약하세요.
    - 80~99점: 우수한 답안이나 표현의 미숙, 미세한 키워드 누락 등 누락된 '사소한 디테일'이 무엇인지 짚어주세요.
    - 40~79점: 개념의 일부를 오해했거나 모범 답안의 필수 조건(핵심 키워드 등)을 상당 부분 놓친 감점 원인을 분석하세요.
    - 0~39점: 핵심 개념을 완전히 잘못 이해했거나 문제의 의도와 전혀 다른 답을 작성한 근본적인 원인을 분석하세요.
    
    응답은 반드시 아래의 JSON 형식과 동일해야 하며, 다른 부연 설명이나 텍스트는 포함하지 마세요.
    {{
        "analysis": "획득 점수({request.score}점/100점)를 토대로 학생의 답안을 냉철하게 분석하여, 감점 원인이나 오답 이유를 설명한 내용",
        "core_concept": "이 문제를 완벽하게 맞추기 위해 반드시 머릿속에 정립해야 하는 핵심 이론 및 개념 정리",
        "tip": "다음 시험에서 만점(100점)을 받기 위해 보완해야 할 구체적인 학습 방향 및 팁"
    }}

    문제: {request.question}
    모범 답안: {request.correct_answer}
    학생 답안: {request.student_answer}
    획득 점수: {request.score}점 (100점 만점)
    """

    # 2. format='json' 옵션을 추가하여 Ollama가 JSON으로만 응답하도록 강제
    try:
        response = ollama.chat(
            model='qwen2.5:3b', 
            messages=[{'role': 'user', 'content': prompt}], 
            options={'temperature': 0.5},
            format='json' 
        )
        
        response_text = response['message']['content'].strip()
        result = json.loads(response_text)
        
        # 3. 데이터 추출 및 공백 제거
        analysis = result.get("analysis", "").strip()
        core_concept = result.get("core_concept", "").strip()
        tip = result.get("tip", "").strip()
        
        return {
            "analysis": analysis,
            "core_concept": core_concept,
            "tip": tip
        }
        
    # 4. JSON 파싱 및 예외 처리
    except (json.JSONDecodeError, Exception) as e:
        raise HTTPException(
            status_code=500, 
            detail=f"오답노트 생성 중 에러가 발생했거나 응답을 파싱하지 못했습니다. 에러: {str(e)}"
        )