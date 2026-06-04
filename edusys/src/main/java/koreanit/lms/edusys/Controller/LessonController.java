package koreanit.lms.edusys.Controller;

import koreanit.lms.edusys.Dto.LessonDTO;
import koreanit.lms.edusys.Entity.Lesson;
import koreanit.lms.edusys.Entity.Progress;
import koreanit.lms.edusys.Entity.Subject;
import koreanit.lms.edusys.Service.LessonService;
import koreanit.lms.edusys.Service.ProgressService;
import koreanit.lms.edusys.Service.SubjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/lessons")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class LessonController {

    private final LessonService lessonService;
    private final ProgressService progressService;
    private final SubjectService subjectService;

    @GetMapping
    @Transactional(readOnly = true)
    public List<LessonDTO> getAllLessons() {
        return lessonService.findAllLessons().stream()
                .map(LessonDTO::new)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public LessonDTO getLessonById(@PathVariable Integer id) {
        Lesson lesson = lessonService.findLessonById(id)
                .orElseThrow(() -> new RuntimeException("Lesson not found"));
        return new LessonDTO(lesson);
    }

    @GetMapping("/subject/{subId}")
    public List<LessonDTO> getLessonsBySubject(@PathVariable Integer subId) {
        return lessonService.findLessonsBySubjectId(subId).stream()
                .map(LessonDTO::new)
                .collect(Collectors.toList());
    }

    @GetMapping("/teacher/{tid}")
    public List<LessonDTO> getLessonsByTeacher(@PathVariable Integer tid) {
        return lessonService.findLessonsByTeacherId(tid).stream()
                .map(LessonDTO::new)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}/student/{studentId}")
    public Map<String, Object> getLessonWithProgress(
            @PathVariable Integer id,
            @PathVariable Integer studentId) {
        
        Lesson lesson = lessonService.findLessonById(id)
                .orElseThrow(() -> new RuntimeException("Lesson not found with id: " + id));
        List<Progress> progresses = progressService.findAllProgressesByStudent(studentId);

        Map<String, Object> map = new HashMap<>();
        map.put("lesson", new LessonDTO(lesson));
        
        // Progress 리스트에서 현재 Lesson(lid)에 해당하는 진도 정보 찾기
        Progress progress = progresses.stream()
                .filter(p -> p.getLesson() != null && 
                            lesson.getLid() != null && 
                            lesson.getLid().equals(p.getLesson().getLid()))
                .findFirst()
                .orElse(null);
        
        int lastTime = progress != null ? progress.getProgressed() : 0;
        map.put("lastTime", lastTime);
        
        Integer lessonDuration = lesson.getDuration();
        double percent = (lessonDuration != null && lessonDuration > 0) 
                ? (lastTime * 100.0) / lessonDuration : 0;
        map.put("percent", Math.min(100, (int) Math.round(percent)));
        
        return map;
    }

    @PostMapping
    public Lesson createLesson(@RequestBody Lesson lesson) {
        // Spring이 JSON을 Lesson 객체로 자동 변환합니다.
        return lessonService.createLesson(lesson);
    }

    @DeleteMapping("/{id}")
    public void deleteLesson(@PathVariable Integer id) {
        lessonService.deleteLesson(id);
    }

    @PutMapping("/{id}")
    public void updateLesson(@PathVariable Integer id, @RequestBody Lesson lesson) {
        lessonService.updateLesson(id, lesson);
    }
}