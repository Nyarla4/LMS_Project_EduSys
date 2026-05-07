package koreanit.lms.edusys.Service;

import koreanit.lms.edusys.Entity.Grade;
import koreanit.lms.edusys.Repository.GradeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class GradeService {
    private final GradeRepository gradeRepository;

    public List<Grade> findAll() {
        return gradeRepository.findAll();
    }

    public Optional<Grade> findById(Long id) {
        return gradeRepository.findById(id);
    }

    public Grade save(Grade grade) {
        return gradeRepository.save(grade);
    }

    public void deleteById(Long id) {
        gradeRepository.deleteById(id);
    }
}