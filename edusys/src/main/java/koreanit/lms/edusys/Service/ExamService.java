package koreanit.lms.edusys.Service;

import koreanit.lms.edusys.Entity.Exam;
import koreanit.lms.edusys.Repository.ExamRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ExamService {
    private final ExamRepository examRepository;

    public List<Exam> findAll() {
        return examRepository.findAll();
    }

    public Optional<Exam> findById(Long id) {
        return examRepository.findById(id);
    }

    public Exam save(Exam exam) {
        return examRepository.save(exam);
    }

    public void deleteById(Long id) {
        examRepository.deleteById(id);
    }
}