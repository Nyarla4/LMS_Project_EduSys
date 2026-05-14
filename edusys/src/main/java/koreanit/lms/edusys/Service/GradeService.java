package koreanit.lms.edusys.Service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import koreanit.lms.edusys.Dto.GradeDTO;
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

    public List<GradeDTO> findAllGrades() {
        List<GradeDTO> gradeDTOs = new ArrayList<>();
        for (Grade grade : gradeRepository.findAll()) {
            gradeDTOs.add(new GradeDTO(grade));
        }
        return gradeDTOs;
    }

    public List<GradeDTO> findAllGradesByStudent(Integer sid) {
        List<GradeDTO> gradeDTOs = new ArrayList<>();
        for (Grade grade : gradeRepository.findByStudentSid(sid)) {
            gradeDTOs.add(new GradeDTO(grade));
        }
        return gradeDTOs;
    }

    public List<GradeDTO> findAllGradesBySubject(Integer subid) {
        List<GradeDTO> gradeDTOs = new ArrayList<>();
        for (Grade grade : gradeRepository.findBySubjectSubid(subid)) {
            gradeDTOs.add(new GradeDTO(grade));
        }
        return gradeDTOs;
    }

    public GradeDTO findGradeById(Integer gid) {
        if(gid == null) {
            return null;
        }
        Grade grade = gradeRepository.findById(gid).orElse(null);
        if (grade == null) {
            return null;
        }
        return new GradeDTO(grade);
    }

    public Grade createGrade(Integer sid, Integer subid) {
        Grade grade = new Grade();
        Student student = studentService.findById(sid);
        Subject subject = subjectService.findSubjectById(subid);
        grade.setStudent(student);
        grade.setSubject(subject);
        return gradeRepository.save(grade);
    }
    
    public Grade createGrade(Grade grade) {
        if(grade == null) {
            return null;
        }
        return gradeRepository.save(grade);
    }

    public Grade saveGrade(Integer gid, String score) {
        if(gid == null) {
            return null;
        }
        Grade existingGrade = gradeRepository.findById(gid).orElse(null);
        if (existingGrade != null) {
            existingGrade.setScore(score);
            return gradeRepository.save(existingGrade);
        }
        return null;
    }

    public void deleteGrade(Integer gid) {
        if(gid == null) {
            return;
        }
        Grade existingGrade = gradeRepository.findById(gid).orElse(null);
        if (existingGrade != null) {
            gradeRepository.delete(existingGrade);
        }
    }
}