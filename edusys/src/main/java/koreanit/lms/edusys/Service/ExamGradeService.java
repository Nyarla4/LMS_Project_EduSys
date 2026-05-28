package koreanit.lms.edusys.Service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import koreanit.lms.edusys.Dto.ExamGradeDTO;
import koreanit.lms.edusys.Entity.Exam;
import koreanit.lms.edusys.Entity.ExamGrade;
import koreanit.lms.edusys.Entity.Student;
import koreanit.lms.edusys.Repository.ExamGradeRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ExamGradeService {
    private final ExamGradeRepository examGradeRepository;
    private final ExamService examService;
    private final StudentService studentService;

    public List<ExamGrade> findAllExamGrades() {
        return examGradeRepository.findAll();
    }

    public List<ExamGrade> findAllExamGradesByExam(Integer eid) {
        return examGradeRepository.findByExamEid(eid);
    }

    public Optional<ExamGrade> findExamGradeById(Integer egid) {
        if(egid == null) {
            return Optional.empty();
        }
        return examGradeRepository.findById(egid);
    }

    public ExamGrade createExamGrade(Integer eid, Integer sid) {
        Optional<Exam> oExam = examService.findExamById(eid);
        if(oExam.isEmpty())
            return null;
        Exam exam = oExam.get();
        Student student = studentService.findById(sid);
        if(student == null){
            return null;
        }
        ExamGrade grade = new ExamGrade();
        grade.setExam(exam);
        grade.setStudent(student);
        grade.setAnswer("");
        grade.setScore("");
        return examGradeRepository.save(grade);
    }

    public void submitAnswer(ExamGradeDTO dto) {
        Exam exam = examService.findExamById(dto.getEid())
                .orElseThrow(() -> new RuntimeException("시험 정보를 찾을 수 없습니다. ID: " + dto.getEid()));
        
        Student student = studentService.findById(dto.getSid());
        
        ExamGrade grade = new ExamGrade();
        grade.setExam(exam);
        grade.setStudent(student);
        grade.setAnswer(dto.getAnswer());
        grade.setScore(""); // 초기 점수는 빈 값으로 설정
        
        examGradeRepository.save(grade);
    }

    public ExamGrade answerExam(Integer egid, String answer){
        Optional<ExamGrade> oExamGrade = findExamGradeById(egid);
        if(oExamGrade.isEmpty())
            return null;
        ExamGrade examGrade = oExamGrade.get();
        examGrade.setAnswer(answer);
        return examGradeRepository.save(examGrade);
    }
    
    public ExamGrade gradeExam(Integer egid, String score){
        Optional<ExamGrade> oExamGrade = findExamGradeById(egid);
        if(oExamGrade.isEmpty())
            return null;
        ExamGrade examGrade = oExamGrade.get();
        examGrade.setScore(score);
        return examGradeRepository.save(examGrade);
    }
}