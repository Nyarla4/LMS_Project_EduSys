package koreanit.lms.edusys.Service;

import java.util.List;

import org.springframework.stereotype.Service;

import koreanit.lms.edusys.Entity.Grade;
import koreanit.lms.edusys.Entity.Student;
import koreanit.lms.edusys.Entity.Subject;
import koreanit.lms.edusys.Repository.GradeRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class GradeService {
    private final GradeRepository gradeRepository;
    private final StudentService studentService;
    private final SubjectService subjectService;

    public List<Grade> findAllGrades() {
        return gradeRepository.findAll();
    }

    public List<Grade> findAllGradesByStudent(Integer sid) {
        return gradeRepository.findByStudentSid(sid);
    }

    public List<Grade> findAllGradesBySubject(Integer subid) {
        return gradeRepository.findBySubjectSubid(subid);
    }

    public Grade createGrade(Integer sid, Integer subid) {
        Grade grade = new Grade();
        Student student = studentService.findById(sid);
        Subject subject = subjectService.findSubjectById(subid);
        grade.setStudent(student);
        grade.setSubject(subject);
        return gradeRepository.save(grade);
    }
}