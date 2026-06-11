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
        // 강의등록 상태 저장용(대기상태를 default 값)
        subject.setSubStatus(Subject.SubStatus.WAIT);

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

        // 강의등록 상태가 OKAY 인지 확인
        for (Subject subject : subjects) {
            if (subject.getSubStatus() != Subject.SubStatus.OKAY) {
                continue;
            }
            // OKAY 상태면 아래 정보들 노출
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
    // 강의상태 변경
    @Transactional
    public void updateSubjectStatus(Integer subid, Subject.SubStatus status) {
        if (subid == null) {
            throw new IllegalArgumentException("subid가 null입니다.");
        }
        Subject subject = subjectRepository.findById(subid)
            .orElseThrow(() -> new RuntimeException("과목이 없습니다."));
        
        // 관리자가 반려 할시 승인대기 상태였던 과목 레포에서 바로 삭제
        if (status == Subject.SubStatus.CANCEL && subject.getSubStatus() == Subject.SubStatus.WAIT) {
            List<Lesson> lessons = lessonRepository.findBySubjectSubid(subid);
            // FK 제약 문제를 피하기 위해 Lesson 선삭제 후 Subject 삭제
            if (lessons != null && !lessons.isEmpty()) {
                lessonRepository.deleteAll(lessons);
            }
            subjectRepository.delete(subject);
            return;
        }
        
        subject.setSubStatus(status);
        subjectRepository.save(subject);
    }
}