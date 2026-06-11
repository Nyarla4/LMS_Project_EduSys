package koreanit.lms.edusys.Service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import koreanit.lms.edusys.Entity.Exam;
import koreanit.lms.edusys.Repository.ExamRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ExamService {
    private final ExamRepository examRepository;

    public List<Exam> findAllExams() {
        return examRepository.findAll();
    }

    public List<Exam> findAllExamsBySubject(Integer subid) {
        return examRepository.findByExamSetSubjectSubid(subid);
    }

    public List<Exam> findAllExamsByExamSet(Integer esid) {
        return examRepository.findByExamSetEsid(esid);
    }

    public Optional<Exam> findExamById(Integer eid) {
        if(eid == null) {
            return Optional.empty();
        }
        return examRepository.findById(eid);
    }

    public Exam createExam(Exam exam) {
        if(exam == null)
            return null;
        return examRepository.save(exam);
    }
    
    public Exam saveExam(Exam exam) {
        if(exam == null) {
            return null;
        }
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