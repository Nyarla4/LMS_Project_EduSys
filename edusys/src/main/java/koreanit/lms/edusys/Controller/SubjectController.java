package koreanit.lms.edusys.Controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import java.nio.file.Paths;
import java.nio.file.Path;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;

import koreanit.lms.edusys.Dto.LessonSubDTO;
import koreanit.lms.edusys.Dto.LessonSubResponseDTO;
import koreanit.lms.edusys.Dto.SubjectDTO;
import koreanit.lms.edusys.Entity.Subject;
import koreanit.lms.edusys.Entity.Teacher;
import koreanit.lms.edusys.Service.SubjectService;
import koreanit.lms.edusys.Service.TeacherService;
import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/subjects")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class SubjectController {
    private final TeacherService teacherService;
    private final SubjectService subjectService;

    private static final String PDF_UPLOAD_DIR = "uploads/pdf/";


    @GetMapping("/teacher/{tid}")
    public ResponseEntity<List<SubjectDTO>> getSubjectsByTeacherId(@PathVariable Integer tid) {
        Teacher teacher = teacherService.findTeacherById(tid);
        if (teacher == null) {
            return ResponseEntity.notFound().build();
        }
        List<SubjectDTO> subjects = subjectService.findSubjectsByTeacherId(teacher.getTid())
                .stream().map(SubjectDTO::new).collect(Collectors.toList());
        return ResponseEntity.ok(subjects);
    }

    @GetMapping("/{suid}")
    public ResponseEntity<SubjectDTO> getSubjectById(@PathVariable Integer suid) {
        Subject subject = subjectService.findSubjectById(suid);
        if (subject == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(new SubjectDTO(subject));
    }

    // 수강신청 페이지 과목 조회 API
    @GetMapping("/apply")
    public ResponseEntity<List<LessonSubResponseDTO>> getApplySubjects() {
        List<LessonSubResponseDTO> subjects = subjectService.findApplySubjects();
        return ResponseEntity.ok(subjects);
    }


    // 강의등록 버튼으로 API 요청
    @PostMapping
    public ResponseEntity<?> createLesson(@RequestBody LessonSubDTO request) 
    {
        subjectService.createLesson(request);
        return ResponseEntity.ok().build();
    }

    // 강의 계획서 PDF 업로드 API
    @PostMapping("/{subid}/upload-syllabus")
    public ResponseEntity<?> uploadSyllabus(@PathVariable Integer subid, @RequestParam("file") MultipartFile file) {
        try {
            System.out.println("===> [1. START] Syllabus upload requested for subid: " + subid);
            Subject subject = subjectService.findSubjectById(subid);
            if (subject == null) {
                return ResponseEntity.status(404).body("데이터베이스에서 과목 ID " + subid + "를 찾을 수 없습니다.");
            }

            // 기존 파일 정보 가져오기 및 로그 출력
            String oldFileName = subject.getPlanFile();
            System.out.println("===> [2. CHECK DB] Current planFile in DB: [" + (oldFileName == null ? "null" : oldFileName) + "]");

            // 1. 업로드 디렉토리 확인
            Path uploadPath = Paths.get(PDF_UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // 2. 삭제 로직 실행
            if (oldFileName != null && !oldFileName.trim().isEmpty() && !oldFileName.equals("syllabus.pdf")) {
                try {
                    Path oldFilePath = uploadPath.resolve(oldFileName).normalize();
                    System.out.println("===> [3. DELETE ATTEMPT] Target path: " + oldFilePath.toAbsolutePath());
                    
                    if (Files.deleteIfExists(oldFilePath)) {
                        System.out.println("===> [4. DELETE SUCCESS] Old file removed from disk.");
                    } else {
                        System.out.println("===> [4. DELETE SKIP] File does not exist on disk.");
                    }
                } catch (Exception e) {
                    // 파일이 브라우저에서 열려있어 잠겼거나 권한 문제일 경우
                    System.err.println("===> [4. DELETE ERROR] Could not delete file: " + e.getMessage());
                }
            } else {
                System.out.println("===> [3. DELETE SKIP] No valid old file to delete or it is default syllabus.");
            }

            // 3. 새 파일 저장
            String fileName = subid + "_" + file.getOriginalFilename();
            System.out.println("===> [5. SAVING] New file name: " + fileName);
            
            Path filePath = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            subject.setPlanFile(fileName);
            subjectService.saveSubject(subject); 
            System.out.println("===> [6. FINISH] Database updated successfully.");

            return ResponseEntity.ok().body(fileName);
        } catch (IOException e) {
            System.err.println("===> [CRITICAL ERROR] " + e.getMessage());
            return ResponseEntity.internalServerError().body("파일 저장 중 오류 발생: " + e.getMessage());
        }
    }

}
