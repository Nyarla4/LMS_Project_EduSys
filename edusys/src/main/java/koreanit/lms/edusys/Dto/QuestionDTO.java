package koreanit.lms.edusys.Dto;

import koreanit.lms.edusys.Entity.Question;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class QuestionDTO {
    private Integer queid;
    private Integer sid;
    private Integer lid;
    private String content;
    
    public QuestionDTO(Question question) {
        this.queid = question.getQueid();
        this.sid = question.getStudent().getSid();
        this.lid = question.getLesson().getLid();
        this.content = question.getContent();
    }
}