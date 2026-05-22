package koreanit.lms.edusys.Dto;

import koreanit.lms.edusys.Entity.Answer;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class AnswerDTO {
    private Integer ansid;
    private Integer queid;
    private Integer tid;
    private String content;
    
    public AnswerDTO(Answer answer) {
        this.ansid = answer.getAnsid();
        this.queid = answer.getQuestion().getQueid();
        this.tid = answer.getTeacher().getTid();
        this.content = answer.getContent();
    }
}