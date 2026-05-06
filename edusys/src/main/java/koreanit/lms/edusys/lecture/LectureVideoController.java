package koreanit.lms.edusys.lecture;

import koreanit.lms.edusys.lecture.LectureVideo;
import koreanit.lms.edusys.lecture.LectureVideoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/lecture-videos")
@RequiredArgsConstructor
public class LectureVideoController {

    private final LectureVideoService lectureVideoService;

    private static final String UPLOAD_DIR = "uploads/videos/";

    @GetMapping
    public List<LectureVideo> getAllLectureVideos() {
        return lectureVideoService.findAll();
    }

    @GetMapping("/{id}")
    public LectureVideo getLectureVideoById(@PathVariable Long id) {
        return lectureVideoService.findById(id)
                .orElseThrow(() -> new RuntimeException("LectureVideo not found with id: " + id));
    }

    @PostMapping
    public LectureVideo saveLectureVideo(@RequestBody LectureVideo lectureVideo) {
        return lectureVideoService.save(lectureVideo);
    }

    @PostMapping("/upload")
    public ResponseEntity<LectureVideo> uploadVideo(
            @RequestParam("file") MultipartFile file,
            @RequestParam("lectureId") Long lectureId,
            @RequestParam("week") Integer week,
            @RequestParam("title") String title,
            @RequestParam(value = "duration", required = false) Integer duration) throws IOException {

        // 파일 저장
        String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        Path uploadPath = Paths.get(UPLOAD_DIR);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        Path filePath = uploadPath.resolve(fileName);
        Files.copy(file.getInputStream(), filePath);

        // URL 생성 (정적 리소스로 접근 가능하도록)
        String fileUrl = "/api/files/videos/" + fileName;

        // LectureVideo 엔티티 생성 및 저장
        LectureVideo lectureVideo = new LectureVideo();
        lectureVideo.setLectureId(lectureId);
        lectureVideo.setWeek(week);
        lectureVideo.setTitle(title);
        lectureVideo.setFileUrl(fileUrl);
        lectureVideo.setDuration(duration);

        LectureVideo saved = lectureVideoService.save(lectureVideo);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/upload-blob")
    public ResponseEntity<LectureVideo> uploadVideoAsBlob(
            @RequestParam("file") MultipartFile file,
            @RequestParam("lectureId") Long lectureId,
            @RequestParam("week") Integer week,
            @RequestParam("title") String title,
            @RequestParam(value = "duration", required = false) Integer duration) throws IOException {

        // BLOB 방식: 파일 데이터를 byte[]로 DB에 직접 저장
        LectureVideo lectureVideo = new LectureVideo();
        lectureVideo.setLectureId(lectureId);
        lectureVideo.setWeek(week);
        lectureVideo.setTitle(title);
        lectureVideo.setVideoData(file.getBytes()); // 파일 데이터를 DB에 저장
        lectureVideo.setContentType(file.getContentType());
        lectureVideo.setOriginalFileName(file.getOriginalFilename());
        lectureVideo.setDuration(duration);

        LectureVideo saved = lectureVideoService.save(lectureVideo);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/blob/{id}")
    public ResponseEntity<byte[]> getVideoAsBlob(@PathVariable Long id) {
        LectureVideo video = lectureVideoService.findById(id)
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
    public void deleteLectureVideo(@PathVariable Long id) {
        lectureVideoService.deleteById(id);
    }
}
