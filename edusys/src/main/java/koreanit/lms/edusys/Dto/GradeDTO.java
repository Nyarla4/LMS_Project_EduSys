package koreanit.lms.edusys.Dto;

import koreanit.lms.edusys.Entity.Grade;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GradeDTO {
    private Integer gid;

    private String studentName;
    private String subjectName;
    private String score;
    
    public GradeDTO(Grade grade) {
        this.gid = grade.getGid();
        this.studentName = grade.getStudent().getUser().getUsername();
        this.subjectName = grade.getSubject().getName();
        this.score = grade.getScore();
    }
}