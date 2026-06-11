package koreanit.lms.edusys.Controller;

import java.util.List;

import org.springframework.http.ResponseEntity;

import koreanit.lms.edusys.Dto.NoticeDTO;
import koreanit.lms.edusys.Entity.Notice;
import koreanit.lms.edusys.Service.NoticeService;
import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/api/notices")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class NoticeController {
    private final NoticeService noticeService;

    @GetMapping("/all")
    public ResponseEntity<List<Notice>> getAllNotices() {
        List<Notice> notices = noticeService.findAllNotices(); // 서비스에서 리스트를 가져옴

        return ResponseEntity.ok(notices); // 데이터와 함께 200 OK 전송
    }

    @GetMapping("")
    public ResponseEntity<List<Notice>> getActiveNotices() {
        List<Notice> notices = noticeService.findAllActiveNotices(); // 서비스에서 리스트를 가져옴

        if (notices.isEmpty()) {
            return ResponseEntity.noContent().build(); // 데이터가 없으면 204 No Content
        }

        return ResponseEntity.ok(notices); // 데이터와 함께 200 OK 전송
    }

    @PostMapping("")
    public ResponseEntity<Notice> CreateNotice(@RequestBody NoticeDTO noticeDto) {
        Notice newNotice = new Notice();
        newNotice.setTitle(noticeDto.getTitle());
        newNotice.setContent(noticeDto.getContent());
        newNotice.setAuthor(noticeDto.getUserName());
        newNotice.setActive(true); // 새 공지는 기본적으로 활성화 상태로 설정   
        noticeService.createNotice(newNotice); // 새 공지 저장
        return ResponseEntity.ok(newNotice); // 데이터와 함께 200 OK 전송
    }

    @GetMapping("/detail/{nid}")
    public ResponseEntity<Notice> getNoticeById(@PathVariable Integer nid) {
        Notice notice = noticeService.findNoticeById(nid); // 서비스에서 특정 공지를 가져옴

        if (notice == null) {
            return ResponseEntity.noContent().build(); // 공지가 없으면 404 Not Found
        }

        return ResponseEntity.ok(notice); // 데이터와 함께 200 OK 전송
    }

    @PutMapping("/detail/{nid}")
    public ResponseEntity<Notice> updateNotice(@PathVariable Integer nid, @RequestBody Notice updatedNotice) {
        Notice updated = noticeService.updateNotice(nid, updatedNotice);
        return ResponseEntity.ok(updated);
    }
    
    @DeleteMapping("/detail/{nid}")
    public ResponseEntity<Void> deleteNotice(@PathVariable Integer nid) {
        noticeService.deleteNotice(nid);
        return ResponseEntity.noContent().build();
    }
    
    @PutMapping("{nid}/active")
    public ResponseEntity<Notice> setActiveNotice(@PathVariable Integer nid, @RequestParam boolean active) {
        Notice updated = noticeService.setActiveNotice(nid, active);
        return ResponseEntity.ok(updated);
    }
}