package koreanit.lms.edusys.Controller;

import koreanit.lms.edusys.Dto.LessonDTO;
import koreanit.lms.edusys.Entity.Lesson;
import koreanit.lms.edusys.Entity.Progress;
import koreanit.lms.edusys.Service.LessonService;
import koreanit.lms.edusys.Service.ProgressService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.UUID;

@RestController
@RequestMapping("/api/lessons")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class LessonController {

    private final LessonService lessonService;
    private final ProgressService progressService;

    private static final String UPLOAD_DIR = "uploads/videos/";

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
        return lessonService.createLesson(lesson);
    }

    @PostMapping("/upload")
    public ResponseEntity<Lesson> uploadVideo(
            @RequestParam("file") MultipartFile file,
            @RequestParam("lessonId") Integer lessonId,
            @RequestParam("title") String title) throws IOException {

        String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        Path uploadPath = Paths.get(UPLOAD_DIR);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        Path filePath = uploadPath.resolve(fileName);
        Files.copy(file.getInputStream(), filePath);

        // getVideo 메서드의 매핑 경로인 /api/lessons/video/에 맞게 수정
        String fileUrl = "/api/lessons/video/" + fileName;

        Lesson lesson = lessonService.findLessonById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found"));
        
        lesson.setName(title);
        lesson.setFileUrl(fileUrl);

        Lesson saved = lessonService.createLesson(lesson);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/upload-blob")
    public ResponseEntity<Lesson> uploadVideoAsBlob(
            @RequestParam("file") MultipartFile file,
            @RequestParam("lessonId") Integer lessonId,
            @RequestParam("title") String title) throws IOException {

        String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        Path uploadPath = Paths.get(UPLOAD_DIR);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        Path filePath = uploadPath.resolve(fileName);
        Files.copy(file.getInputStream(), filePath);

        // getVideo 메서드의 매핑 경로인 /api/lessons/video/에 맞게 수정
        String fileUrl = "/api/lessons/video/" + fileName;

        Lesson lesson = lessonService.findLessonById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found"));

        lesson.setName(title);
        lesson.setFileUrl(fileUrl);

        Lesson saved = lessonService.createLesson(lesson);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/video/{fileName}")
    public ResponseEntity<Resource> getVideo(@PathVariable String fileName) throws IOException {
        Path filePath = Paths.get(UPLOAD_DIR).resolve(fileName);
        Resource resource = new FileSystemResource(filePath);

        if (!resource.exists()) {
            return ResponseEntity.notFound().build();
        }

        // 영상 파일의 content type을 결정
        String contentType = Files.probeContentType(filePath);
        if (contentType == null) {
            contentType = "application/octet-stream";
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + fileName + "\"")
                .body(resource);
    }

    @DeleteMapping("/{id}")
    public void deleteLesson(@PathVariable Integer id) {
        lessonService.deleteLesson(id);
    }
}