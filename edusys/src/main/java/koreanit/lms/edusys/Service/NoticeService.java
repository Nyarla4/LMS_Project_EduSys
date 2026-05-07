package koreanit.lms.edusys.Service;

import java.util.List;

import org.springframework.stereotype.Service;

import koreanit.lms.edusys.Entity.Notice;
import koreanit.lms.edusys.Repository.NoticeRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NoticeService {
    private final NoticeRepository noticeRepository;

    public List<Notice> findAllNotices() {
        return noticeRepository.findAll();
    }

    public List<Notice> findAllActiveNotices() {
        return noticeRepository.findAll().stream().filter(Notice::isActive).toList();
    }

    public Notice findNoticeById(Integer nid) {
        return noticeRepository.findById(nid).orElse(null);
    }

    public Notice updateNotice(Integer nid, Notice updatedNotice) {
        Notice existingNotice = findNoticeById(nid);
        if (existingNotice == null) {
            return null;
        }
        existingNotice.setTitle(updatedNotice.getTitle());
        existingNotice.setContent(updatedNotice.getContent());
        return noticeRepository.save(existingNotice);
    }

    public void deleteNotice(Integer nid) {
        Notice existingNotice = findNoticeById(nid);
        if (existingNotice != null) {
            noticeRepository.delete(existingNotice);
        }
    }

    public Notice setActiveNotice(Integer nid, boolean active) {
        Notice existingNotice = findNoticeById(nid);
        if (existingNotice == null) {
            return null;
        }
        existingNotice.setActive(active);
        return noticeRepository.save(existingNotice);
    }
}