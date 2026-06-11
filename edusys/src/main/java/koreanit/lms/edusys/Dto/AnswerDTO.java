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
        if (answer == null) return;
        this.ansid = answer.getAnsid();
        this.queid = answer.getQuestion() != null ? answer.getQuestion().getQueid() : null;
        this.tid = answer.getTeacher() != null ? answer.getTeacher().getTid() : null;
        this.content = answer.getContent();
    }
}