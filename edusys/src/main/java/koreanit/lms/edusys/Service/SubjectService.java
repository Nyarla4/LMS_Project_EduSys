package koreanit.lms.edusys.Service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import koreanit.lms.edusys.Dto.LessonSubDTO;
import koreanit.lms.edusys.Dto.LessonSubResponseDTO;
import koreanit.lms.edusys.Entity.Lesson;
import koreanit.lms.edusys.Entity.Subject;
import koreanit.lms.edusys.Entity.Teacher;
import koreanit.lms.edusys.Repository.LessonRepository;
import koreanit.lms.edusys.Repository.SubjectRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SubjectService {
    private final SubjectRepository subjectRepository;
    private final LessonRepository lessonRepository;
    private final TeacherService teacherService;
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

    // 과목 정보 단독 저장/수정 (강의 계획서 업데이트 등)
    @Transactional
    public void saveSubject(Subject subject) {
        subjectRepository.save(subject);
    }

    // 강의 등록시 Subject와 Lesson을 같이 등록
    @Transactional
    public void createLesson(LessonSubDTO request) {
        Subject subject = new Subject();
        subject.setMajor(request.getMajor());
        subject.setName(request.getSubName());
        subject.setCapacity(request.getCapacity());
        subject.setPlanFile(request.getPlanFile());
        subject.setStartDate(request.getStartDate());
        subject.setEndDate(request.getEndDate());
        Teacher teacher = teacherService.findTeacherById(request.getTid());
        subject.setTeacher(teacher);

        Subject savedSubject = subjectRepository.save(subject);
        Lesson lesson = new Lesson();
        lesson.setName(request.getLessonName());
        lesson.setFileUrl(request.getFileUrl());
        lesson.setSubject(savedSubject);
        // Lesson 테이블에 날짜가 있어야 출석 데이터 생성이 가능하므로 과목 시작일을 기본값으로 설정합니다.
        lesson.setDate(request.getStartDate()); 

        lessonService.createLesson(lesson);
    }

    // 수강신청 페이지에 필요한 정보들을 DTO로 변환 -> 각 엔티티에 없는 내용 때문에
    public List<LessonSubResponseDTO> findApplySubjects() {
        List<Subject> subjects = subjectRepository.findAll();
        List<LessonSubResponseDTO> result = new ArrayList<>();

        for (Subject subject : subjects) {
            LessonSubResponseDTO dto = new LessonSubResponseDTO();
            dto.setSubid(subject.getSubid());
            dto.setMajor(subject.getMajor());
            dto.setSubName(subject.getName());
            dto.setCapacity(subject.getCapacity());
            dto.setStartDate(subject.getStartDate());
            dto.setEndDate(subject.getEndDate());

            if (subject.getTeacher() != null && subject.getTeacher().getUser() != null) {
                dto.setTeacherName(subject.getTeacher().getUser().getUsername());
            } else {
                dto.setTeacherName("미정");
            }

            List<Lesson> lessons = lessonRepository.findBySubjectSubid(subject.getSubid());
            if (lessons != null && !lessons.isEmpty()) {
                Lesson lesson = lessons.get(0);
                dto.setLessonName(lesson.getName());
            } else {
                dto.setLessonName("미정");
            }
            result.add(dto);
        }
        return result;
    }
}