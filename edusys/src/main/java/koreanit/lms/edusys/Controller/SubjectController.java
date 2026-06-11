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
import koreanit.lms.edusys.Entity.Subject.SubStatus;
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
    @PostMapping("/upload-syllabus")
    public ResponseEntity<?> uploadSyllabus(
            @RequestParam(required = false) Integer subid, 
            @RequestParam Integer tid, 
            @RequestParam("file") MultipartFile file) {
        try {
            // 업로드 디렉토리 확인
            Path uploadPath = Paths.get(PDF_UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // 기존 파일 삭제 (수정 시 subid가 있는 경우만 해당)
            if (subid != null) {
                Subject subject = subjectService.findSubjectById(subid);
                if (subject != null && subject.getPlanFile() != null) {
                    String oldFileName = subject.getPlanFile();
                    if (!oldFileName.equals("syllabus.pdf")) {
                        Path oldFilePath = uploadPath.resolve(oldFileName).normalize();
                        Files.deleteIfExists(oldFilePath);
                    }
                }
            }

            // 새 파일명 생성: 교사ID_원본파일명
            String fileName = tid + "_" + file.getOriginalFilename();
            Path filePath = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // 이미 생성된 과목의 계획서를 수정하는 경우 DB 업데이트 수행
            if (subid != null) {
                Subject subject = subjectService.findSubjectById(subid);
                if (subject != null) {
                    subject.setPlanFile(fileName);
                    subjectService.saveSubject(subject);
                }
            }

            return ResponseEntity.ok().body(fileName);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("파일 저장 중 오류 발생: " + e.getMessage());
        }
    }
    // 강의등록 상태를 요청
    @PutMapping("/{subid}/status")
    public ResponseEntity<?> updateSubjectStatus(
        @PathVariable Integer subid,
        @RequestParam Subject.SubStatus status) 
        {
            subjectService.updateSubjectStatus(subid, status);
            return ResponseEntity.ok().build();
        }
    
    @GetMapping("/wait")
    public ResponseEntity<List<SubjectDTO>> getWaitedSubjects() {
        List<Subject> waitSubs = subjectService.findAllSubjects();
        waitSubs.removeIf(s -> s.getSubStatus()!=SubStatus.WAIT);
        List<SubjectDTO> result = new java.util.ArrayList<SubjectDTO>();
        for (Subject subject : waitSubs) {
            result.add(new SubjectDTO(subject));
        }
        return ResponseEntity.ok(result);
    }
    

}
