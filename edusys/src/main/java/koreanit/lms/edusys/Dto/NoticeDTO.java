package koreanit.lms.edusys.Dto;

import koreanit.lms.edusys.Entity.Notice;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class NoticeDTO {
    private Integer nid;
    private String title;
    private String content;
    private String userName;

    public NoticeDTO(Notice notice) {
        this.nid = notice.getNid();
        this.title = notice.getTitle();
        this.content = notice.getContent();
        this.userName = notice.getAuthor();
    }
}