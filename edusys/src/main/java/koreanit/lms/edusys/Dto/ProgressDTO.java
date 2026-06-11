package koreanit.lms.edusys.Dto;

import koreanit.lms.edusys.Entity.Progress;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ProgressDTO {
    private Integer pid;
    private Integer sid;
    private Integer lid;
    private Integer progressed;

    public ProgressDTO(Progress progress) {
        this.pid = progress.getPid();
        this.sid = progress.getStudent() != null ? progress.getStudent().getSid() : null;
        this.lid = progress.getLesson() != null ? progress.getLesson().getLid() : null;
        this.progressed = progress.getProgressed();
    }
}