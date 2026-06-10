package koreanit.lms.edusys.Service;

import koreanit.lms.edusys.Entity.Student;
import koreanit.lms.edusys.Entity.Work;
import koreanit.lms.edusys.Entity.WorkSubmit;
import koreanit.lms.edusys.Repository.StudentRepository;
import koreanit.lms.edusys.Repository.WorkRepository;
import koreanit.lms.edusys.Repository.WorkSubmitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class WorkSubmitService {
    private final WorkSubmitRepository workSubmitRepository;
    private final WorkRepository workRepository;
    private final StudentRepository studentRepository;

    private static final String WORK_UPLOAD_DIR = "uploads/work/";

    public List<WorkSubmit> findSubmissionsByWork(Integer wid) {
        return workSubmitRepository.findByWorkWid(wid);
    }

    public Optional<WorkSubmit> findSubmissionByWorkAndStudent(Integer wid, Integer sid) {
        return workSubmitRepository.findByWorkWidAndStudentSid(wid, sid);
    }

    @Transactional
    public WorkSubmit submitWork(Integer wid, Integer sid, MultipartFile file) throws IOException {
        Path uploadPath = Paths.get(WORK_UPLOAD_DIR);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // 1. 기존 제출 내역 확인 및 이전 파일 삭제 (강의계획서 로직과 동일하게 처리)
        WorkSubmit existingSubmit = workSubmitRepository.findByWorkWidAndStudentSid(wid, sid).orElse(null);
        if (existingSubmit != null && existingSubmit.getFileName() != null) {
            try {
                Path oldFilePath = uploadPath.resolve(existingSubmit.getFileName()).normalize();
                Files.deleteIfExists(oldFilePath);
            } catch (Exception e) {
                // 파일이 없거나 삭제할 수 없는 경우 로그만 남기고 진행
                System.err.println("Old file deletion failed: " + e.getMessage());
            }
        }

        // 2. 새 파일 저장 (요청하신 대로 원본 파일명 그대로 사용)
        String fileName = file.getOriginalFilename();
        Path filePath = uploadPath.resolve(fileName);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        Work work = workRepository.findById(wid)
                .orElseThrow(() -> new RuntimeException("과제를 찾을 수 없습니다."));
        Student student = studentRepository.findById(sid)
                .orElseThrow(() -> new RuntimeException("학생을 찾을 수 없습니다."));

        WorkSubmit submit = (existingSubmit != null) ? existingSubmit : new WorkSubmit();
        submit.setWork(work);
        submit.setStudent(student);
        submit.setFileName(fileName);
        
        return workSubmitRepository.save(submit);
    }

    @Transactional
    public WorkSubmit updateGrade(Integer wsid, String grade) {
        WorkSubmit submit = workSubmitRepository.findById(wsid)
                .orElseThrow(() -> new RuntimeException("제출 내역을 찾을 수 없습니다."));
        submit.setGrade(grade);
        return workSubmitRepository.save(submit);
    }
    @Transactional
    public void deleteSubmissionsByStudentAndSubject(Integer sid, Integer subid) {
        List<WorkSubmit> submissions = workSubmitRepository.findByStudentSidAndWorkSubjectSubid(sid, subid);

        for (WorkSubmit submission : submissions) {
            deleteUploadFile(submission.getFileName());
        }

        workSubmitRepository.deleteAll(submissions);
    }

    private void deleteUploadFile(String fileName) {
        if (fileName == null || fileName.isBlank()) {
            return;
        }

        try {
            Path uploadPath = Paths.get(WORK_UPLOAD_DIR);
            Path targetPath = uploadPath.resolve(fileName).normalize();
            Files.deleteIfExists(targetPath);
        } catch (Exception e) {
            System.err.println("Work submit file deletion failed: " + e.getMessage());
        }
    }
}
