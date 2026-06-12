from fastapi import FastAPI
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
from youtube_transcript_api import YouTubeTranscriptApi
# 기존에 쓰시던 import 문들 (chromadb, ollama, SentenceTransformer 등)

app = FastAPI()

# Spring Boot가 파이썬으로 보낼 데이터의 형식을 정의합니다.
class QuestionRequest(BaseModel):
    class_id: int
    class_name: str
    url_list: list[str]
    question: str

# POST 방식으로 /api/ask 주소에 요청이 오면 이 함수가 실행됩니다.
@app.post("/api/ask")
def ask_ai(request: QuestionRequest):

    api = YouTubeTranscriptApi()
    model = SentenceTransformer('intfloat/multilingual-e5-small')
    
    video_ids = request.url_list
    for video_id in video_ids:
        if "v=" in video_id:
            video_id = video_id.split("v=")[1]
        result = api.fetch(video_id)
        fullText = []
        currentText = ""
        idx = 0
        snippet_count = len(result.snippets) # 3. 가져온 결과에서 텍스트 조각(snippets)의 개수를 세어봅니다.
        for item in result.snippets:
            idx += 1
            currentText += item.text + " "
            if idx >= snippet_count / 10:
                fullText.append(currentText.strip())
                currentText = ""
                idx = 0
        if currentText: fullText.append(currentText.strip())
        embeddings = model.encode(fullText)
    # ---------------------------------------------------------
    # 여기에 우리가 만들었던 '검색(Retrieval) 및 답변 생성(Generation)' 
    # 코드가 들어가야 합니다!
    #
    # 💡 힌트: 
    # 1. request.question 을 임베딩해서 검색합니다.
    # 2. where={"class_id": request.class_id} 로 필터링합니다.
    # 3. Ollama 프롬프트에 넣고 답변을 받습니다.
    # ---------------------------------------------------------
    
    final_answer = "여기에 Ollama가 만든 답변이 들어가면 됩니다."
    
    # Spring Boot가 이해할 수 있도록 딕셔너리(JSON) 형태로 돌려줍니다.
    return {"answer": final_answer}