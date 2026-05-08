package koreanit.lms.edusys.Service;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GradeDTO {
    private Integer gid;

    private String studentName;
    private String subjectName;
    private String score;
}