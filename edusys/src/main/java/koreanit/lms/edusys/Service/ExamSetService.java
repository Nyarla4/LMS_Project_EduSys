package koreanit.lms.edusys.Service;

import koreanit.lms.edusys.Entity.ExamSet;
import koreanit.lms.edusys.Entity.Subject;
import koreanit.lms.edusys.Repository.ExamSetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ExamSetService {
    private final ExamSetRepository examSetRepository;
    private final SubjectService subjectService;

    public List<ExamSet> findAllExamSets() {
        return examSetRepository.findAll();
    }

    public List<ExamSet> findAllExamSetsBySubject(Integer subid) {
        return examSetRepository.findBySubjectSubid(subid);
    }

    public Optional<ExamSet> findExamSetById(Integer esid) {
        return examSetRepository.findById(esid);
    }

    @Transactional
    public ExamSet createExamSet(Integer subid, String name, LocalDateTime examDate, String status) {
        Subject subject = subjectService.findSubjectById(subid);
        if (subject == null) {
            throw new RuntimeException("Subject not found with id: " + subid);
        }
        ExamSet examSet = new ExamSet();
        examSet.setName(name);
        examSet.setSubject(subject);
        examSet.setExamDate(examDate);
        examSet.setStatus(status);
        return examSetRepository.save(examSet);
    }

    @Transactional
    public ExamSet updateExamSet(Integer esid, String name, LocalDateTime examDate, String status) {
        ExamSet existingExamSet = examSetRepository.findById(esid)
                .orElseThrow(() -> new RuntimeException("ExamSet not found with id: " + esid));
        existingExamSet.setName(name);
        existingExamSet.setExamDate(examDate);
        existingExamSet.setStatus(status);
        return examSetRepository.save(existingExamSet);
    }

    @Transactional
    public void deleteExamSet(Integer esid) {
        examSetRepository.deleteById(esid);
    }
}