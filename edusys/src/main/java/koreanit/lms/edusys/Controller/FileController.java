package koreanit.lms.edusys.Controller;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api/files")
@CrossOrigin(origins = "http://localhost:3000")
public class FileController {

    private static final String UPLOAD_DIR = "uploads/";

    @GetMapping("/videos/{filename:.+}")
    public ResponseEntity<Resource> getVideo(@PathVariable String filename) {
        try {
            Path filePath = Paths.get(UPLOAD_DIR + "videos/" + filename);
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                return ResponseEntity.ok()
                        .contentType(MediaType.APPLICATION_OCTET_STREAM)
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/syllabus.pdf")
    public ResponseEntity<Resource> getSyllabus(@RequestParam(required = false, defaultValue = "false") boolean download) {
        try {
            Path filePath = Paths.get(UPLOAD_DIR + "syllabus.pdf");
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                String contentDisposition = download ? "attachment; filename=\"syllabus.pdf\"" : "inline";
                return ResponseEntity.ok()
                        .contentType(MediaType.APPLICATION_PDF)
                        .header(HttpHeaders.CONTENT_DISPOSITION, contentDisposition)
                        .body(resource);
            } else {
                return ResponseEntity.noContent().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // uploads/pdf 폴더 내의 PDF 파일을 반환하는 엔드포인트
    @GetMapping("/pdf/{filename:.+}")
    public ResponseEntity<Resource> getPdf(@PathVariable String filename, @RequestParam(required = false, defaultValue = "false") boolean download) {
        try {
            Path filePath = Paths.get(UPLOAD_DIR + "pdf/" + filename);
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                String contentDisposition = download ? "attachment; filename=\"" + filename + "\"" : "inline";
                return ResponseEntity.ok()
                        .contentType(MediaType.APPLICATION_PDF)
                        .header(HttpHeaders.CONTENT_DISPOSITION, contentDisposition)
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // uploads/work 폴더 내의 과제 파일을 반환하는 엔드포인트
    @GetMapping("/work/{filename:.+}")
    public ResponseEntity<Resource> getWorkFile(@PathVariable String filename) {
        try {
            Path filePath = Paths.get(UPLOAD_DIR + "work/" + filename);
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                return ResponseEntity.ok()
                        .contentType(MediaType.APPLICATION_OCTET_STREAM)
                        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}