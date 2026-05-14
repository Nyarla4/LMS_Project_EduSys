/*package koreanit.lms.edusys.Controller;

import koreanit.lms.edusys.Entity.LessonVideo;
import koreanit.lms.edusys.Service.LessonVideoService;
import koreanit.lms.edusys.Entity.Progress;
import koreanit.lms.edusys.Service.ProgressService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
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
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/lesson-videos")
@RequiredArgsConstructor
public class LessonVideoController {

    private final LessonVideoService lessonVideoService;
    private final ProgressService progressService;

    private static final String UPLOAD_DIR = "uploads/videos/";

    @GetMapping
    public List<LessonVideo> getAllLessonVideos() {
        return lessonVideoService.findAll();
    }

    @GetMapping("/{id}")
    public LessonVideo getLessonVideoById(@PathVariable Long id) {
        return lessonVideoService.findById(id)
                .orElseThrow(() -> new RuntimeException("LessonVideo not found with id: " + id));
    }

    @GetMapping("/lesson/{lessonId}/student/{studentId}")
    public List<Map<String, Object>> getVideosWithProgress(
            @PathVariable Long lessonId,
            @PathVariable Integer studentId) {
        
        List<LessonVideo> videos = lessonVideoService.findByLessonId(lessonId);
        List<Progress> progresses = progressService.findAllProgressesByStudent(studentId);

        return videos.stream().map(video -> {
            Map<String, Object> map = new HashMap<>();
            map.put("video", video);
            
            Progress progress = progresses.stream()
                    .filter(p -> p.getLesson() != null && p.getLesson().equals(video.getId()))// 현재 Progress에 Lesson Video가 없으므로 getLesson 으로 대체, 추후 Lesson Video 관련 수정시 참조
                    .findFirst()
                    .orElse(null);
            
            int lastTime = progress != null ? progress.getProgressed() : 0;
            map.put("lastTime", lastTime);
            
            double percent = (video.getDuration() != null && video.getDuration() > 0) 
                    ? (lastTime * 100.0) / video.getDuration() : 0;
            map.put("percent", Math.min(100, (int) Math.round(percent)));
            
            return map;
        }).collect(Collectors.toList());
    }

    @PostMapping
    public LessonVideo saveLessonVideo(@RequestBody LessonVideo lessonVideo) {
        return lessonVideoService.save(lessonVideo);
    }

    @PostMapping("/upload")
    public ResponseEntity<LessonVideo> uploadVideo(
            @RequestParam("file") MultipartFile file,
            @RequestParam("lessonId") Long lessonId,
            @RequestParam("week") Integer week,
            @RequestParam("title") String title,
            @RequestParam(value = "duration", required = false) Integer duration) throws IOException {

        String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        Path uploadPath = Paths.get(UPLOAD_DIR);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        Path filePath = uploadPath.resolve(fileName);
        Files.copy(file.getInputStream(), filePath);

        String fileUrl = "/api/files/videos/" + fileName;

        LessonVideo lessonVideo = new LessonVideo();
        lessonVideo.setLessonId(lessonId);
        lessonVideo.setWeek(week);
        lessonVideo.setTitle(title);
        lessonVideo.setFileUrl(fileUrl);
        lessonVideo.setDuration(duration);

        LessonVideo saved = lessonVideoService.save(lessonVideo);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/upload-blob")
    public ResponseEntity<LessonVideo> uploadVideoAsBlob(
            @RequestParam("file") MultipartFile file,
            @RequestParam("lessonId") Long lessonId,
            @RequestParam("week") Integer week,
            @RequestParam("title") String title,
            @RequestParam(value = "duration", required = false) Integer duration) throws IOException {

        LessonVideo lessonVideo = new LessonVideo();
        lessonVideo.setLessonId(lessonId);
        lessonVideo.setWeek(week);
        lessonVideo.setTitle(title);
        lessonVideo.setVideoData(file.getBytes());
        lessonVideo.setContentType(file.getContentType());
        lessonVideo.setOriginalFileName(file.getOriginalFilename());
        lessonVideo.setDuration(duration);

        LessonVideo saved = lessonVideoService.save(lessonVideo);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/blob/{id}")
    public ResponseEntity<byte[]> getVideoAsBlob(@PathVariable Long id) {
        LessonVideo video = lessonVideoService.findById(id)
                .orElseThrow(() -> new RuntimeException("Video not found"));

        if (video.getVideoData() == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(video.getContentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + video.getOriginalFileName() + "\"")
                .body(video.getVideoData());
    }

    @DeleteMapping("/{id}")
    public void deleteLessonVideo(@PathVariable Long id) {
        lessonVideoService.deleteById(id);
    }
}*/