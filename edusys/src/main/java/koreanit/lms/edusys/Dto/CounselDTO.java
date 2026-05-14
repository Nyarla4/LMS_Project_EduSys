package koreanit.lms.edusys.Dto;

import koreanit.lms.edusys.Entity.Counsel;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
public class CounselDTO {
    private Integer couid;
    private Integer sid;
    private Integer tid;
    private String title;
    private String content;
    private String comment;

    public CounselDTO(Counsel counsel) {
        couid = counsel.getCouid();
        sid = counsel.getStudent().getSid();
        tid = counsel.getTeacher().getTid();
        title = counsel.getTitle();
        content = counsel.getContent();
        comment = counsel.getComment();
    }
}