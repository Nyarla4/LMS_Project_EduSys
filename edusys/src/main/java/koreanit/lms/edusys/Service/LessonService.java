package koreanit.lms.edusys.Service;

import koreanit.lms.edusys.Entity.Lesson;
import koreanit.lms.edusys.Entity.Subject; // Subject 엔티티 import 추가
import koreanit.lms.edusys.Repository.LessonRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LessonService {
    private final LessonRepository lessonRepository;
    private final AttendanceService attendanceService;
    private final AIService aiService;

    @Transactional(readOnly = true)
    public List<Lesson> findAllLessons() {
        List<Lesson> lessons = lessonRepository.findAll();
        calculateWeeksInBulk(lessons);
        return lessons;
    }

    /**
     * 리스트로 조회 시 N+1 쿼리 문제를 방지하기 위해 메모리 상에서 주차를 계산합니다.
     */
    private void calculateWeeksInBulk(List<Lesson> lessons) {
        if (lessons == null || lessons.isEmpty()) return;

        Map<Integer, List<Lesson>> groupedBySubject = lessons.stream()
                .filter(l -> l.getSubject() != null)
                .collect(Collectors.groupingBy(l -> l.getSubject().getSubid()));

        groupedBySubject.values().forEach(subjectLessons -> {
            subjectLessons.sort(Comparator.comparing(Lesson::getLid));
            for (int i = 0; i < subjectLessons.size(); i++) {
                subjectLessons.get(i).setWeek(i + 1);
            }
        });
    }

    @Transactional(readOnly = true)
    public Optional<Lesson> findLessonById(Integer id) {
        return lessonRepository.findById(id).map(lesson -> {
            calculateAndSetWeek(lesson);
            return lesson;
        });
    }

    @Transactional(readOnly = true)
    public List<Lesson> findLessonsBySubjectId(Integer subid) {
        List<Lesson> lessons = lessonRepository.findBySubjectSubid(subid);
        calculateWeeksInBulk(lessons);
        return lessons;
    }

    @Transactional(readOnly = true)
    public List<Lesson> findLessonsByTeacherId(Integer tid) {
        List<Lesson> lessons = lessonRepository.findBySubjectTeacherTid(tid);
        calculateWeeksInBulk(lessons);
        return lessons;
    }

    /**
     * 과목 내에서 생성 순서에 따라 주차를 계산하여 설정합니다.
     */
    private void calculateAndSetWeek(Lesson lesson) {
        if (lesson.getSubject() != null && lesson.getLid() != null) {
            // 해당 과목에서 현재 lid보다 작거나 같은 데이터의 개수가 곧 "n주차"가 됨
            long count = lessonRepository.countBySubjectSubidAndLidLessThanEqual(
                lesson.getSubject().getSubid(), 
                lesson.getLid()
            );
            lesson.setWeek((int) count);
        }
    }

    @Transactional
    public Lesson createLesson(Lesson lesson) {
        if (lesson == null) return null;
        Lesson savedLesson = lessonRepository.save(lesson);
        // 강의 등록 시 해당 강의 내용을 db에 저장
        if (savedLesson.getSubject() != null && savedLesson.getFileUrl() != null) {
            aiService.embedLesson(savedLesson.getSubject().getSubid(), savedLesson.getFileUrl());
        }
        // 새로운 강의 등록 시 해당 날짜의 출석부 미리 생성
        if (savedLesson.getDate() != null && savedLesson.getSubject() != null) {
            attendanceService.createInitialAttendance(savedLesson);
        }
        return savedLesson;
    }

    @Transactional
    public void deleteLesson(Integer id) {
        if (id != null && lessonRepository.existsById(id)) {
            lessonRepository.deleteById(id);
        }
    }

    @Transactional
    public Lesson updateLesson(Integer id, Lesson lessonDetails) {
        Lesson lesson = lessonRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lesson not found with id: " + id));
        lesson.setName(lessonDetails.getName());
        lesson.setDate(lessonDetails.getDate());
        lesson.setFileUrl(lessonDetails.getFileUrl());
        calculateAndSetWeek(lesson); // 날짜 변경 등에 대비해 주차 정보 갱신
        return lessonRepository.save(lesson);
    }
}
