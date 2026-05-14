package koreanit.lms.edusys.Service;

import java.util.List;

import org.springframework.stereotype.Service;

import koreanit.lms.edusys.Dto.LessonSubDTO;
import koreanit.lms.edusys.Entity.Lesson;
import koreanit.lms.edusys.Entity.Subject;
import koreanit.lms.edusys.Repository.LessonRepository;
import koreanit.lms.edusys.Repository.SubjectRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SubjectService {
    private final SubjectRepository subjectRepository;
    private final LessonRepository lessonRepository;

    public List<Subject> findAllSubjects() {
        return subjectRepository.findAll();
    }

    public Subject findSubjectById(Integer subid) {
        if(subid == null) {
            return null;
        }
        return subjectRepository.findById(subid).orElse(null);
    }

    public List<Subject> findSubjectsByTeacherId(Integer tid) {
        if(tid == null) {
            return null;
        }
        return subjectRepository.findByTeacherTid(tid);
    }
    // 강의 등록시 Subject와 Lesson을 같이 등록
    public void createLesson(LessonSubDTO request) {
        Subject subject = new Subject();

        subject.setMajor(request.getMajor());
        subject.setName(request.getSubName());
        subject.setCapacity(request.getCapacity());
        subject.setPlanFile(request.getPlanFile());
        subject.setStartDate(request.getStartDate());
        subject.setEndDate(request.getEndDate());

        Subject savedSubject = subjectRepository.save(subject);

        Lesson lesson = new Lesson();
        lesson.setName(request.getLessonName());
        lesson.setFileUrl(request.getFileUrl());
        lesson.setSubject(savedSubject);

        lessonRepository.save(lesson);
    }
}