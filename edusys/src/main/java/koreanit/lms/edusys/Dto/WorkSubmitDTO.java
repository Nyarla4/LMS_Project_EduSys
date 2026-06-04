package koreanit.lms.edusys.Dto;

import koreanit.lms.edusys.Entity.WorkSubmit;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class WorkSubmitDTO {
    private Integer wsid;
    private Integer wid;
    private Integer sid;
    private String studentName;
    private String fileName;
    private String grade;

    public WorkSubmitDTO(WorkSubmit submit) {
        if (submit == null) return;
        this.wsid = submit.getWsid();
        this.wid = submit.getWork().getWid();
        this.sid = submit.getStudent().getSid();
        this.studentName = submit.getStudent().getUser().getUsername();
        this.fileName = submit.getFileName();
        this.grade = submit.getGrade();
    }
}