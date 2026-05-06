package koreanit.lms.edusys.Service;

import java.util.List;

import org.springframework.stereotype.Service;

import koreanit.lms.edusys.Entity.Subject;
import koreanit.lms.edusys.Repository.SubjectRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SubjectService {
    private final SubjectRepository subjectRepository;

    public List<Subject> findAllSubjects() {
        return subjectRepository.findAll();
    }

    public Subject findSubjectById(Integer subid) {
        return subjectRepository.findById(subid).orElse(null);
    }

    public List<Subject> findSubjectsByTeacherId(Integer tid) {
        return subjectRepository.findByTeacherTid(tid);
    }
}