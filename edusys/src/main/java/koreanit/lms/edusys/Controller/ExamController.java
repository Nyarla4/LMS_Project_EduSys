package koreanit.lms.edusys.Controller;

import koreanit.lms.edusys.Dto.ExamDTO;
import koreanit.lms.edusys.Dto.ExamGradeDTO;
import koreanit.lms.edusys.Entity.Exam;
import koreanit.lms.edusys.Entity.ExamGrade;
import koreanit.lms.edusys.Entity.Subject;
import koreanit.lms.edusys.Entity.ExamSet;
import koreanit.lms.edusys.Service.ExamGradeService;
import koreanit.lms.edusys.Service.ExamService;
import koreanit.lms.edusys.Service.ExamSetService;
import koreanit.lms.edusys.Service.SubjectService;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;


@RestController
@RequestMapping("/api/exams")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class ExamController {
    private final ExamService examService;
    private final SubjectService subjectService;
    private final ExamSetService examSetService;
    private final ExamGradeService examGradeService;

    @GetMapping
    public List<Exam> getAllExams() {
        return examService.findAllExams();
    }

    @GetMapping("/{eid}")
    public ResponseEntity<ExamDTO> getExamById(@PathVariable Integer eid) {
        Optional<Exam> oExam = examService.findExamById(eid);
        if(oExam.isEmpty()){
            return ResponseEntity.notFound().build();
        }
        Exam exam = oExam.get();
        return ResponseEntity.ok(new ExamDTO(exam));
    }

    @GetMapping("/subject/{subId}")
    public List<ExamDTO> getExamsBySubject(@PathVariable Integer subId) {
        List<Exam> exams = examService.findAllExamsBySubject(subId);
        List<ExamDTO> result = new ArrayList<ExamDTO>();
        for (Exam exam : exams){
            result.add(new ExamDTO(exam));
        }
        return result;
    }

    @GetMapping("/examset/{esid}")
    public List<ExamDTO> getExamsByExamSet(@PathVariable Integer esid) {
        List<Exam> exams = examService.findAllExamsByExamSet(esid);
        List<ExamDTO> result = new ArrayList<ExamDTO>();
        for (Exam exam : exams){
            result.add(new ExamDTO(exam));
        }
        return result;
    }

    @PostMapping("/create")
    public ResponseEntity<ExamDTO> createExam(@RequestBody ExamDTO dto) {
        Optional<ExamSet> oExamSet = examSetService.findExamSetById(dto.getEsid());
        if (oExamSet.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Exam exam = new Exam();
        exam.setQuestion(dto.getQuestion());
        exam.setAnswer(dto.getAnswer());
        exam.setExamSet(oExamSet.get());
        exam.setObjectiveOption1(dto.getObjectiveOption1());
        exam.setObjectiveOption2(dto.getObjectiveOption2());
        exam.setObjectiveOption3(dto.getObjectiveOption3());
        exam.setObjectiveOption4(dto.getObjectiveOption4());
        ExamDTO result = new ExamDTO(examService.createExam(exam));
        return ResponseEntity.ok(result);
    }
    

    @PutMapping
    public ResponseEntity<ExamDTO> saveExam(@RequestBody ExamDTO dto) {
        Optional<Exam> oExam = examService.findExamById(dto.getEid());
        if(oExam.isEmpty())
            return ResponseEntity.notFound().build();
        
        Exam exam = oExam.get();
        exam.setQuestion(dto.getQuestion());
        exam.setAnswer(dto.getAnswer());
        exam.setObjectiveOption1(dto.getObjectiveOption1());
        exam.setObjectiveOption2(dto.getObjectiveOption2());
        exam.setObjectiveOption3(dto.getObjectiveOption3());
        exam.setObjectiveOption4(dto.getObjectiveOption4());
        
        ExamDTO result = new ExamDTO(examService.saveExam(exam));
        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/{id}")
    public void deleteExam(@PathVariable Integer id) {
        examService.deleteExam(id);
    }

    // 학생이 답안을 제출할 때 호출 (ExamGrade 테이블에 새로운 레코드 생성)
    @PostMapping("/submit-answer")
    public ResponseEntity<Void> submitAnswer(@RequestBody ExamGradeDTO dto) {
        examGradeService.submitAnswer(dto);
        return ResponseEntity.ok().build();
    }

    // 학생이 본인의 제출 답안을 확인할 때 호출
    @GetMapping("/grade/{eid}/student/{sid}")
    public ResponseEntity<ExamGradeDTO> getStudentExamGrade(@PathVariable Integer eid, @PathVariable Integer sid) {
        return examGradeService.findExamGradeByExamAndStudent(eid, sid)
                .map(grade -> ResponseEntity.ok(new ExamGradeDTO(grade)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/grading/{eid}")
    public ResponseEntity<List<ExamGradeDTO>> getExamGradesBySubject(@PathVariable Integer eid) {
        List<ExamGrade> exams = examGradeService.findAllExamGradesByExam(eid);
        List<ExamGradeDTO> result = new ArrayList<ExamGradeDTO>();
        for (ExamGrade examGrade : exams) {
            result.add(new ExamGradeDTO(examGrade));
        }
        return ResponseEntity.ok(result);
    }
    
    @PutMapping("/grading")
    public ResponseEntity<List<ExamGradeDTO>> saveExamGrades(@RequestBody List<ExamGradeDTO> gradeDtos) {
        List<ExamGradeDTO> result = new ArrayList<ExamGradeDTO>();
        for (ExamGradeDTO gradeDto : gradeDtos) {
            ExamGrade savedGrade = examGradeService.gradeExam(gradeDto.getEgid(), gradeDto.getScore());
            result.add(new ExamGradeDTO(savedGrade));
        }
        return ResponseEntity.ok(result);
    }
}