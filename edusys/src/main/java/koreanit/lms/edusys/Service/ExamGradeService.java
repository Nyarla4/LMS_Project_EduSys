package koreanit.lms.edusys.Service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

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
            return null;
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

    public ExamGrade answerExam(Integer egid, String answer){
        Optional<ExamGrade> oExamGrade = findExamGradeById(egid);
        if(oExamGrade.isEmpty())
            return null;
        ExamGrade examGrade = oExamGrade.get();
        examGrade.setAnswer(answer);
        return examGradeRepository.save(examGrade);
    }
}