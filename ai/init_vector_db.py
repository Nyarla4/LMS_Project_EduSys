import os
import pymysql
from sentence_transformers import SentenceTransformer
from youtube_transcript_api import YouTubeTranscriptApi
import chromadb

# ==========================================
# [구조화] 설정 및 자원 연결 정의 (Connection Configuration)
# ==========================================
DB_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": "sqId",
    "database": "edusys_db",
    "charset": "utf8mb4"
}

print("로컬 AI 임베딩 모델 및 ChromaDB 초기화 중...")
model = SentenceTransformer('intfloat/multilingual-e5-small')
chroma_client = chromadb.PersistentClient(path="./chroma_data")
collection = chroma_client.get_or_create_collection(name="lecture_transcripts")
api = YouTubeTranscriptApi()

def fetch_youtube_lessons():
    """로컬 MySQL에서 유튜브 영상 경로가 등록된 강의 및 과목 데이터를 조회합니다."""
    connection = pymysql.connect(**DB_CONFIG)
    try:
        with connection.cursor(pymysql.cursors.DictCursor) as cursor:
            # lessons와 subjects 조인하여 subid와 file_url 가져오기
            sql = """
                SELECT l.subid, l.file_url , l.date
                FROM lessons l 
                WHERE l.file_url IS NOT NULL AND l.file_url != ''
            """
            cursor.execute(sql)
            return cursor.fetchall()
    finally:
        connection.close()

# ==========================================
# [흐름] 전처리 및 임베딩 적재 (Embedding Flow)
# ==========================================
def main():
    try:
        lessons = fetch_youtube_lessons()
    except Exception as e:
        print(f"MySQL DB 연결 실패: {e}")
        print("db_config 변수의 접속 정보를 확인하세요.")
        return

    print(f"총 {len(lessons)}개의 수집 가능한 영상 데이터를 발견했습니다.")

    for lesson in lessons:
        subid = lesson['subid']
        url = lesson['file_url']
        date = lesson['date']
        
        # URL에서 Video ID 추출
        video_id = url
        if "v=" in url:
            video_id = url.split("v=")[1].split("&")[0]
        elif "youtu.be/" in url:
            video_id = url.split("youtu.be/")[1].split("?")[0]
            
        print(f"\n[작업 시작] 과목 ID: {subid} | 비디오 ID: {video_id}")
        
        try:
            # 기존 자막 수집 메커니즘 호환 적용 (ko, en 순서)
            result = api.fetch(video_id, languages=['ko', 'en'])
            
            full_text = []
            current_text = ""
            idx = 0
            snippet_count = len(result.snippets)
            
            for item in result.snippets:
                 idx += 1
                 current_text += item.text + " "
                 if idx >= snippet_count / 10:
                     full_text.append(current_text.strip())
                     current_text = ""
                     idx = 0
            if current_text: 
                full_text.append(current_text.strip())

            # 임베딩 데이터 생성 및 적재
            embeddings = model.encode(full_text)
            ids = [f"{subid}_{video_id}_{i}" for i in range(len(full_text))]
            metadatas = [{"subid": subid, "text": text, "date":str(date)} for text in full_text]

            collection.add(
                documents=full_text,
                embeddings=embeddings.tolist(),
                metadatas=metadatas,
                ids=ids
            )
            print(f"[성공] 과목 {subid} 자막 분할 본문 {len(full_text)}개 조각 임베딩 완료.")
            
        except Exception as e:
            print(f"[실패] 비디오 {video_id} 자막 수집 오류: {e}")

if __name__ == "__main__":
    main()