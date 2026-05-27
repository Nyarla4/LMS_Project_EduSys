package koreanit.lms.edusys.Service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import koreanit.lms.edusys.Entity.Exam;
import koreanit.lms.edusys.Entity.Subject;
import koreanit.lms.edusys.Repository.SubjectRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class AIService {
    
    private final ExamService examService;
    private final SubjectRepository subjectRepository;
    
    @Value("${ai.server.url:http://localhost:8000}")
    private String aiServerUrl;

    // [구조 수정] FastAPI 전송 스키마에 객관식 여부 필드 추가
    private record ExamGenerateRequest(Integer subid, boolean is_objective) {}
    
    private record ExamGenerateResponse(
        String question, 
        String objectiveOption1, 
        String objectiveOption2, 
        String objectiveOption3, 
        String objectiveOption4, 
        String answer
    ) {}

    // [흐름 수정] 매개변수에 Boolean isObjective 추가
    @Transactional
    public Exam createExamFromAI(Integer subid, Boolean isObjective) {
        
        // 1. 대상 과목(Subject) 검증
        Subject subject = subjectRepository.findById(subid)
            .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 과목입니다. ID: " + subid));

        // 2. FastAPI 서버로 전송할 HTTP 요청 준비
        RestTemplate restTemplate = new RestTemplate();
        String endpoint = aiServerUrl + "/api/exam/generate";
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        
        // 구조 바인딩: 넘겨받은 isObjective 플래그 적용
        ExamGenerateRequest requestBody = new ExamGenerateRequest(subid, isObjective);
        HttpEntity<ExamGenerateRequest> requestEntity = new HttpEntity<>(requestBody, headers);

        try {
            // 3. FastAPI 호출 흐름 제어
            log.info("FastAPI에 문제 출제 요청 중... 과목: {}, 객관식 여부: {}", subject.getName(), isObjective);
            ResponseEntity<ExamGenerateResponse> response = restTemplate.postForEntity(
                endpoint, 
                requestEntity, 
                ExamGenerateResponse.class
            );
            
            ExamGenerateResponse responseBody = response.getBody();
            if (responseBody == null) {
                throw new RuntimeException("AI 서버로부터 비어있는 응답을 받았습니다.");
            }

            // 4. 응답 DTO를 엔티티로 변환 (구조 매핑)
            Exam exam = new Exam();
            exam.setQuestion(responseBody.question());
            exam.setObjectiveOption1(responseBody.objectiveOption1());
            exam.setObjectiveOption2(responseBody.objectiveOption2());
            exam.setObjectiveOption3(responseBody.objectiveOption3());
            exam.setObjectiveOption4(responseBody.objectiveOption4());
            exam.setAnswer(responseBody.answer());
            exam.setSubject(subject);

            // 5. 반환
            return exam;

        } catch (Exception e) {
            log.error("AI 문제 생성 중 오류 발생: {}", e.getMessage());
            throw new RuntimeException("AI 문제 생성 실패", e);
        }
    }

    private record EmbedRequest(Integer subid, String fileUrl) {}

    public void embedLesson(Integer subid, String fileUrl) {
        RestTemplate restTemplate = new RestTemplate();
        String endpoint = aiServerUrl + "/api/lesson/embed";

        EmbedRequest request = new EmbedRequest(subid, fileUrl);
        try {
            restTemplate.postForEntity(endpoint, request, String.class);
            log.info("AI 자막 임베딩 요청 성공: subid={}, url={}", subid, fileUrl);
        } catch (Exception e) {
            log.error("AI 자막 임베딩 요청 실패: {}", e.getMessage());
        }
    }
}