package koreanit.lms.edusys.Dto;

import koreanit.lms.edusys.Entity.Answer;
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
    private String studentName; // UI 표시를 위한 이름 추가
    private Integer lid;
    private String content;
    private AnswerDTO answer;   // 답변 정보 포함
    
    public QuestionDTO(Question question, Answer answer) {
        if (question == null) return;
        this.queid = question.getQueid();
        if (question.getStudent() != null) {
            this.sid = question.getStudent().getSid();
            if (question.getStudent().getUser() != null) {
                this.studentName = question.getStudent().getUser().getUsername();
            }
        }
        if (this.studentName == null) this.studentName = "익명";
        
        this.lid = question.getLesson() != null ? question.getLesson().getLid() : null;
        this.content = question.getContent();
        this.answer = answer != null ? new AnswerDTO(answer) : null;
    }
}