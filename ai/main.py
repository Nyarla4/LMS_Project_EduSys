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

    # 2. 프롬프트 내 JSON Key 명세 엄격화
    if request.is_objective:
        format_instruction = """
        제공된 <강의 내용>만을 바탕으로 객관식 4지 선다형 문제를 1개 출제하세요.
        JSON Key 이름("question", "objectiveOption1", ..., "answer")을 절대 변경하거나 누락하지 마세요.

        {
          "question": "문제 내용",
          "objectiveOption1": "보기1",
          "objectiveOption2": "보기2",
          "objectiveOption3": "보기3",
          "objectiveOption4": "보기4",
          "answer": "정답 번호 (1, 2, 3, 4 중 하나)"
        }
        """
    else:
        format_instruction = """
        제공된 <강의 내용>만을 바탕으로 단답형 또는 서술형 주관식 문제를 1개 출제하세요.
        주관식 문제이더라도 구조 유지를 위해 아래 명시된 JSON Key를 반드시 모두 포함해야 합니다. 
        특히 "answer" Key는 절대로 생략하거나 이름을 바꾸지 마세요.

        {
          "question": "주관식 문제 내용",
          "objectiveOption1": "",
          "objectiveOption2": "",
          "objectiveOption3": "",
          "objectiveOption4": "",
          "answer": "반드시 여기에 주관식 정답 및 모범 답안 문장을 작성하세요."
        }
        """

    prompt = f"""
    당신은 꼼꼼한 시험 출제자입니다. 부가적인 설명 없이 오직 요구된 JSON 포맷으로만 답변하세요.
    {format_instruction}

    <강의 내용>
    {context_text}
    """

    # 3. Ollama 호출
    response = ollama.chat(model='qwen2.5:3b', messages=[
      {'role': 'user', 'content': prompt}
    ], options={'temperature': 0.1})
    
    result_text = response['message']['content'].strip()

    # 4. 정규식을 통한 텍스트 내 JSON 구조 강제 추출 (앞뒤 노이즈 제거)
    match = re.search(r'\{.*\}', result_text, re.DOTALL)
    if match:
        result_text = match.group(0)

    try:
        parsed_json = json.loads(result_text)
        
        # 소형 모델이 소문자/대문자 실수를 하거나 필드를 빠뜨렸을 경우를 대비한 안전장치
        if "answer" not in parsed_json:
            # 혹시 한글로 생성했을 경우 구제 흐름
            if "정답" in parsed_json:
                parsed_json["answer"] = parsed_json.pop("정답")
            elif "모범답안" in parsed_json:
                parsed_json["answer"] = parsed_json.pop("모범답안")
            else:
                raise KeyError("answer key가 존재하지 않습니다.")
                
        return parsed_json
        
    except (json.JSONDecodeError, KeyError, Exception) as e:
        print(f"[JSON 파싱 에러 출력]: {result_text}")  # 터미널에서 AI 원본 확인용
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