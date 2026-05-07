package koreanit.lms.edusys.Service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import koreanit.lms.edusys.Entity.Exam;
import koreanit.lms.edusys.Entity.Subject;
import koreanit.lms.edusys.Repository.ExamRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ExamService {
    private final ExamRepository examRepository;
    private final SubjectService subjectService;

    public List<Exam> findAllExams() {
        return examRepository.findAll();
    }

    public List<Exam> findAllExamsBySubject(Integer subid) {
        return examRepository.findBySubjectSubid(subid);
    }

    public Optional<Exam> findExamById(Integer eid) {
        if(eid == null) {
            return null;
        }
        return examRepository.findById(eid);
    }

    public Exam createExam(Integer subid) {
        Exam exam = new Exam();
        Subject subject = subjectService.findSubjectById(subid);
        if(subject == null) {
            return null;
        }
        exam.setSubject(subject);
        return examRepository.save(exam);
    }

    public void deleteExam(Integer eid) {
        if(eid == null) {
            return;
        }
        Exam existingExam = examRepository.findById(eid).orElse(null);
        if (existingExam != null) {
            examRepository.delete(existingExam);
        }
    }
}