package koreanit.lms.edusys.Service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import koreanit.lms.edusys.Dto.ExamDTO;
import koreanit.lms.edusys.Entity.Exam;
import koreanit.lms.edusys.Entity.ExamSet;
import koreanit.lms.edusys.Entity.Subject;
import koreanit.lms.edusys.Repository.ExamSetRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class AIService {

    private final ExamService examService;
    private final ExamSetRepository examSetRepository;

    @Value("${ai.server.url:http://localhost:8000}")
    private String aiServerUrl;

    private record ExamGenerateRequest(Integer subid, boolean is_objective, String examDate) {
    }

    private record ExamGenerateResponse(
            String question,
            String objectiveOption1,
            String objectiveOption2,
            String objectiveOption3,
            String objectiveOption4,
            String answer) {
    }

    private record GradeRequest(String question, String correct_answer, String student_answer) {
    }

    public record ExamGradeResponse(Integer score, String reason) {
    }

    private record IncorrectNoteRequest(String question, String correct_answer, String student_answer, String score) {
    }

    public record IncorrectNoteResponse(String analysis, String core_concept, String tip) {
    }

    @Transactional
    public ExamDTO createExamFromAI(Integer esid, Boolean isObjective) {
        if(esid == null) {
            throw new IllegalArgumentException("시험지 ID(esid)는 필수입니다.");
        }
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
        ExamGenerateRequest requestBody = new ExamGenerateRequest(subject.getSubid(), isObjective,
                examSet.getExamDate().toString());
        HttpEntity<ExamGenerateRequest> requestEntity = new HttpEntity<>(requestBody, headers);

        try {
            // 3. FastAPI 호출 흐름 제어
            log.info("FastAPI에 문제 출제 요청 중... 과목: {}, 객관식 여부: {}, 시험 일자: {}", subject.getName(), isObjective,
                    examSet.getExamDate());
            ResponseEntity<ExamGenerateResponse> response = restTemplate.postForEntity(
                    endpoint,
                    requestEntity,
                    ExamGenerateResponse.class);

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

    private record EmbedRequest(Integer subid, String fileUrl) {
    }

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

    public ExamGradeResponse gradeExam(Integer eid, String answer) {
        Optional<Exam> examOptional = examService.findExamById(eid);
        if (examOptional.isEmpty()) {
            // 기존의 -1 반환 대신, 구조에 맞게 에러 응답 객체 반환 (혹은 예외 throw 추천)
            return new ExamGradeResponse(-1, "해당 시험이 존재하지 않습니다.");
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

        GradeRequest requestBody = new GradeRequest(question, correctAnswer, submitAnswer);
        HttpEntity<GradeRequest> requestEntity = new HttpEntity<>(requestBody, headers);

        try {
            // 3. FastAPI 호출 흐름 제어
            log.info("FastAPI에 문제 채점 요청 중... 문제: {}, 모범 답안: {}, 학생 답안: {}", question, correctAnswer, submitAnswer);

            // 역직렬화 시 ExamGradeResponse에 score와 reason이 함께 매핑됩니다.
            ResponseEntity<ExamGradeResponse> response = restTemplate.postForEntity(
                    endpoint,
                    requestEntity,
                    ExamGradeResponse.class);

            ExamGradeResponse responseBody = response.getBody();
            if (responseBody == null) {
                throw new RuntimeException("AI 서버로부터 비어있는 응답을 받았습니다.");
            }

            // 로그에 채점 근거도 함께 남기면 디버깅에 좋습니다.
            log.info("채점 완료 -> 점수: {}, 근거: {}", responseBody.score(), responseBody.reason());

            // 4. 점수와 근거가 모두 담긴 DTO를 그대로 반환
            return responseBody;

        } catch (Exception e) {
            log.error("AI 문제 채점 중 오류 발생: {}", e.getMessage());
            throw new RuntimeException("AI 문제 채점 실패", e);
        }
    }

    public IncorrectNoteResponse noteExam(Integer eid, String answer, String score) {
        Optional<Exam> examOptional = examService.findExamById(eid);
        if (examOptional.isEmpty()) {
            // 기존의 -1 반환 대신, 구조에 맞게 에러 응답 객체 반환 (혹은 예외 throw 추천)
            return new IncorrectNoteResponse("해당 시험이 존재하지 않습니다.", "", "");
        }

        Exam exam = examOptional.get();
        String question = exam.getQuestion();
        String correctAnswer = exam.getAnswer();
        String submitAnswer = answer;
        // JSON 형태일 경우 파싱해서 내부 answer 값 추출
        if (answer.trim().startsWith("{")) {
            try {
                ObjectMapper objectMapper = new ObjectMapper();
                JsonNode jsonNode = objectMapper.readTree(answer);
                submitAnswer = jsonNode.get("answer").asText();
            } catch (Exception e) {
                throw new IllegalArgumentException("정답 JSON 파싱 실패: " + answer, e);
            }
        }

        if (!exam.getObjectiveOption1().isBlank()) {
            int answerNum = Integer.parseInt(submitAnswer.trim());

            String analysis = "";
            String coreConcept = "";
            String tip = "";
            if (Integer.parseInt(correctAnswer) == answerNum) {
                analysis = "정답입니다.";
                coreConcept = "";
                tip = "";
            } else {
                analysis = "오답입니다.";
                coreConcept = "답은 " + correctAnswer + "번 입니다.";
                tip = "";
            }
            IncorrectNoteResponse result = new IncorrectNoteResponse(analysis, coreConcept, tip);
            return result;
        }

        // 2. FastAPI 서버로 전송할 HTTP 요청 준비
        RestTemplate restTemplate = new RestTemplate();
        String endpoint = aiServerUrl + "/api/exam/incorrect-note";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        IncorrectNoteRequest requestBody = new IncorrectNoteRequest(question, correctAnswer, submitAnswer, score);
        HttpEntity<IncorrectNoteRequest> requestEntity = new HttpEntity<>(requestBody, headers);

        try {
            // 3. FastAPI 호출 흐름 제어
            log.info("FastAPI에 오답노트 요청 중... 문제: {}, 모범 답안: {}, 학생 답안: {}", question, correctAnswer, submitAnswer);

            // 역직렬화 시 IncorrectNoteResponse에 분석 내용이 함께 매핑됩니다.
            ResponseEntity<IncorrectNoteResponse> response = restTemplate.postForEntity(
                    endpoint,
                    requestEntity,
                    IncorrectNoteResponse.class);

            IncorrectNoteResponse responseBody = response.getBody();
            if (responseBody == null) {
                throw new RuntimeException("AI 서버로부터 비어있는 응답을 받았습니다.");
            }

            // 로그에 채점 근거도 함께 남기면 디버깅에 좋습니다.
            log.info("오답노트 완료 -> 분석: {}, 핵심 개념: {}, 팁: {}", responseBody.analysis(), responseBody.core_concept(),
                    responseBody.tip());

            // 4. 점수와 근거가 모두 담긴 DTO를 그대로 반환
            return responseBody;

        } catch (Exception e) {
            log.error("AI 문제 채점 중 오류 발생: {}", e.getMessage());
            throw new RuntimeException("AI 문제 채점 실패", e);
        }
    }
}