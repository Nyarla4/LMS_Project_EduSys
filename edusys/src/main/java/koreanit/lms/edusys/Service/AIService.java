package koreanit.lms.edusys.Service;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import koreanit.lms.edusys.Dto.ExamDTO;
import koreanit.lms.edusys.Entity.Exam;
import koreanit.lms.edusys.Entity.ExamSet;
import koreanit.lms.edusys.Entity.Subject;
import koreanit.lms.edusys.Repository.ExamSetRepository;
import koreanit.lms.edusys.Repository.SubjectRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class AIService {
    
    private final ExamService examService;
    private final SubjectRepository subjectRepository;
    private final ExamSetRepository examSetRepository;
    
    @Value("${ai.server.url:http://localhost:8000}")
    private String aiServerUrl;

    private record ExamGenerateRequest(Integer subid, boolean is_objective, String examDate) {}

    private record ExamGenerateResponse(
        String question, 
        String objectiveOption1, 
        String objectiveOption2, 
        String objectiveOption3, 
        String objectiveOption4, 
        String answer
    ) {}
    
    private record GradeRequest(String question, String correct_answer, String student_answer) {}
    
    private record ExamGradeResponse(Integer score) {}

    @Transactional
    public ExamDTO createExamFromAI(Integer esid, Boolean isObjective) {
        
        // 1. 대상 시험지(ExamSet) 및 과목 검증
        ExamSet examSet = examSetRepository.findById(esid)
            .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 시험지입니다. ID: " + esid));
        Subject subject = examSet.getSubject();

        // 2. FastAPI 서버로 전송할 HTTP 요청 준비
        RestTemplate restTemplate = new RestTemplate();
        String endpoint = aiServerUrl + "/api/exam/generate";
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        
        // 구조 바인딩: 넘겨받은 isObjective 플래그 적용
        ExamGenerateRequest requestBody = new ExamGenerateRequest(subject.getSubid(), isObjective, examSet.getExamDate().toString());
        HttpEntity<ExamGenerateRequest> requestEntity = new HttpEntity<>(requestBody, headers);

        try {
            // 3. FastAPI 호출 흐름 제어
            log.info("FastAPI에 문제 출제 요청 중... 과목: {}, 객관식 여부: {}, 시험 일자: {}", subject.getName(), isObjective, examSet.getExamDate());
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
            ExamDTO exam = new ExamDTO();
            exam.setQuestion(responseBody.question());
            exam.setObjectiveOption1(responseBody.objectiveOption1());
            exam.setObjectiveOption2(responseBody.objectiveOption2());
            exam.setObjectiveOption3(responseBody.objectiveOption3());
            exam.setObjectiveOption4(responseBody.objectiveOption4());
            exam.setAnswer(responseBody.answer());

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

    public Integer gradeExam(Integer eid, String answer) {
        Optional<Exam> examOptional = examService.findExamById(eid);
        if(examOptional.isEmpty()) {
            return -1; // 시험이 존재하지 않음
        }
        Exam exam = examOptional.get();
        String question = exam.getQuestion();
        String correctAnswer = exam.getAnswer();
        String submitAnswer = answer;

        // 2. FastAPI 서버로 전송할 HTTP 요청 준비
        RestTemplate restTemplate = new RestTemplate();
        String endpoint = aiServerUrl + "/api/exam/grade";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        
        // 구조 바인딩: 넘겨받은 isObjective 플래그 적용
        GradeRequest requestBody = new GradeRequest(question, correctAnswer, submitAnswer);
        HttpEntity<GradeRequest> requestEntity = new HttpEntity<>(requestBody, headers);

        try {
            // 3. FastAPI 호출 흐름 제어
            log.info("FastAPI에 문제 채점 요청 중... 문제: {}, 모범 답안: {}, 학생 답안: {}", question, correctAnswer, submitAnswer);
            ResponseEntity<ExamGradeResponse> response = restTemplate.postForEntity(
                endpoint, 
                requestEntity, 
                ExamGradeResponse.class
            );
            
            ExamGradeResponse responseBody = response.getBody();
            if (responseBody == null) {
                throw new RuntimeException("AI 서버로부터 비어있는 응답을 받았습니다.");
            }

            // 4. 응답 DTO를 엔티티로 변환 (구조 매핑)
            Integer grade = responseBody.score();

            // 5. 반환
            return grade;

        } catch (Exception e) {
            log.error("AI 문제 채점 중 오류 발생: {}", e.getMessage());
            throw new RuntimeException("AI 문제 채점 실패", e);
        }
    }
}