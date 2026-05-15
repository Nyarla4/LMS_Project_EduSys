package koreanit.lms.edusys.Service;

import java.util.List;

import org.springframework.stereotype.Service;

import koreanit.lms.edusys.Dto.LessonSubDTO;
import koreanit.lms.edusys.Entity.Lesson;
import koreanit.lms.edusys.Entity.Subject;
import koreanit.lms.edusys.Repository.SubjectRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SubjectService {
    private final SubjectRepository subjectRepository;
    private final LessonService lessonService;

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
        // Lesson 테이블에 날짜가 있어야 출석 데이터 생성이 가능하므로 과목 시작일을 기본값으로 설정합니다.
        lesson.setDate(request.getStartDate()); 

        lessonService.createLesson(lesson);
    }
}