package koreanit.lms.edusys.subject;

import koreanit.lms.edusys.subject.Subject;
import koreanit.lms.edusys.subject.SubjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class SubjectService {
    private final SubjectRepository subjectRepository;

    public List<Subject> findAll() {
        return subjectRepository.findAll();
    }

    public Optional<Subject> findById(Long id) {
        return subjectRepository.findById(id);
    }

    public Subject save(Subject subject) {
        return subjectRepository.save(subject);
    }

    public void deleteById(Long id) {
        subjectRepository.deleteById(id);
    }
}