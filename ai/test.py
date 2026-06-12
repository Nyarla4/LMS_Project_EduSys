from youtube_transcript_api import YouTubeTranscriptApi

video_id = "https://www.youtube.com/watch?v=5PgqzVG9SCk"
if "v=" in video_id:
    video_id = video_id.split("v=")[1]

# 1. 괄호()를 붙여서 설계도로부터 실체(api 객체)를 만듭니다.
api = YouTubeTranscriptApi()

fullText = []
currentText = ""
idx = 0

# 2. 만들어진 실체에게 fetch(가져오기) 일을 시킵니다.
result = api.fetch(video_id)
snippet_count = len(result.snippets) # 3. 가져온 결과에서 텍스트 조각(snippets)의 개수를 세어봅니다.
for item in result.snippets:
     idx += 1
     currentText += item.text + " "
     if idx >= snippet_count / 10:
         fullText.append(currentText.strip())
         currentText = ""
         idx = 0
if currentText: fullText.append(currentText.strip())
#print(fullText)

from sentence_transformers import SentenceTransformer

# 1. 다국어(한국어/영어 등) 지원이 되는 가벼운 모델을 불러옵니다. 
# (처음 실행 시 모델 다운로드에 시간이 조금 걸릴 수 있습니다)
model = SentenceTransformer('intfloat/multilingual-e5-small')

# 2. 쪼개둔 텍스트 리스트를 통째로 모델에 넣어 임베딩(숫자 배열)으로 변환합니다.
embeddings = model.encode(fullText)

import chromadb

# 1. ChromaDB 클라이언트 생성 (ai 폴더 안의 'chroma_data' 폴더에 물리적 파일로 저장됨)
client = chromadb.PersistentClient(path="./chroma_data")

# 2. 데이터를 담을 '컬렉션(Collection)' 생성 (JPA의 Entity/테이블과 같은 역할)
collection = client.get_or_create_collection(name="lecture_transcripts")

# 테스트용 가상 강의 ID
current_class_id = 5

ids = []
metadatas = []

for i, text in enumerate(fullText):
    ids.append(f"{current_class_id}_{i}")  # 예: "5_0", "5_1", ...
    metadatas.append({"class_id": current_class_id, "text": text})

# 컬렉션에 데이터 추가하기
collection.add(
    documents=fullText,
    embeddings=embeddings.tolist(), # NumPy 배열을 파이썬 리스트로 변환
    metadatas=metadatas,
    ids=ids
)

# (기존 코드 아래에 이어서 작성)

# 1. 사용자의 질문을 정의합니다. (다국어 모델이므로 한글 질문도 잘 이해합니다)
question = "머신러닝 모델을 API로 만드는 이유는 무엇인가요?"

# 2. 질문도 동일한 모델을 사용해 숫자 배열로 변환합니다.
question_embedding = model.encode(question).tolist()

# 3. DB에서 가장 의미가 비슷한 조각(chunk) 2개를 찾습니다.
search_results = collection.query(
    query_embeddings=[question_embedding],
    n_results=2, # 2개만 가져오기
    where={"class_id": current_class_id} # 5번 강의에서만 찾기 (필터링)
)

import ollama

# 1. 검색된 텍스트 조각들(리스트)을 띄어쓰기로 연결하여 하나의 긴 글로 합칩니다.
context_text = " ".join(search_results['documents'][0])

# 2. AI에게 내릴 지시문(Prompt)을 작성합니다. (빈칸을 채워보세요!)
prompt = f"""
당신은 친절한 코딩 선생님입니다.
반드시 아래의 <강의 내용>만을 바탕으로 사용자의 <질문>에 한국어로 답변해 주세요.

<강의 내용>
{ context_text }

<질문>
{ question }
"""

# 3. Ollama를 통해 로컬 AI 모델에게 질문을 보냅니다.
response = ollama.chat(model='llama3', messages=[
  {'role': 'user', 'content': prompt}
])

# 4. 최종 답변 출력!
print("\n🤖 AI 선생님의 답변:")
print(response['message']['content'])