from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
from youtube_transcript_api import YouTubeTranscriptApi
import chromadb
import ollama
import json
import re

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

class GenerateExamRequest(BaseModel):
    subid: int       # 출제할 과목 ID
    is_objective: bool#주관식/객관식 여부

class GradeRequest(BaseModel):
    question: str          # 문제 내용
    correct_answer: str    # 모범 답안
    student_answer: str    # 학생 제출 답안

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
        metadatas = [{"subid": request.subid, "text": text} for text in fullText]

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

    # 1. DB 검색
    search_results = collection.query(
        query_embeddings=[query_embedding],
        n_results=3, 
        where={"subid": request.subid}
    )

    if not search_results['documents'] or not search_results['documents'][0]:
        raise HTTPException(status_code=404, detail="해당 과목의 자막 데이터가 없습니다.")

    context_text = " ".join(search_results['documents'][0])

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
    prompt = f"""
    당신은 엄격하고 공정한 채점자입니다.
    문제와 모범 답안을 기준으로 학생의 답안을 평가하여 0점에서 10점 사이의 정수 점수만 부여하세요.
    응답은 반드시 숫자만 출력해야 합니다. (예: 8)

    문제: {request.question}
    모범 답안: {request.correct_answer}
    학생 답안: {request.student_answer}
    """

    response = ollama.chat(model='qwen2.5:3b', messages=[
      {'role': 'user', 'content': prompt}
    ], options={'temperature': 0.0}) # 채점은 일관성이 중요하므로 temperature를 0으로 설정
    
    score_text = response['message']['content'].strip()
    
    # 숫자 이외의 문자가 섞였을 경우를 대비한 필터링
    score = ''.join(filter(str.isdigit, score_text))
    
    if not score:
        raise HTTPException(status_code=500, detail="점수를 추출하지 못했습니다.")

    return {"score": score}