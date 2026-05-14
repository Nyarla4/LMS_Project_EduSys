package koreanit.lms.edusys.Dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
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
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"}) // UserEntity의 순환 참조 방지
    
    public GradeDTO(Grade grade) {
        this.gid = grade.getGid();
        this.studentName = grade.getStudent().getUser().getUsername();
        this.subjectName = grade.getSubject().getName();
        this.score = grade.getScore();
    }
}