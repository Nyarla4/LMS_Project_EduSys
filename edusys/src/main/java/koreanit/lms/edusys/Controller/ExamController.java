package koreanit.lms.edusys.Controller;

import koreanit.lms.edusys.Dto.ExamDTO;
import koreanit.lms.edusys.Entity.Exam;
import koreanit.lms.edusys.Entity.Subject;
import koreanit.lms.edusys.Service.ExamService;
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

    @PostMapping("/create")
    public ResponseEntity<ExamDTO> createExam(@RequestBody ExamDTO dto) {
        Subject subject = subjectService.findSubjectById(dto.getSubid());
        if (subject == null) {
            return ResponseEntity.notFound().build();
        }
        Exam exam = new Exam();
        exam.setQuestion(dto.getQuestion());
        exam.setAnswer(dto.getAnswer());
        exam.setSubject(subject);
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
}