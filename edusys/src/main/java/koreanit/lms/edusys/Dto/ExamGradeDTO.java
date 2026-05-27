package koreanit.lms.edusys.Dto;

import koreanit.lms.edusys.Entity.ExamGrade;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ExamGradeDTO {

    private Integer egid;
    private Integer sid;
    private String student;
    private Integer eid;
    private String answer;
    private String score;

    public ExamGradeDTO(ExamGrade examGrade) {
        this.egid = examGrade.getEgid();
        this.sid = examGrade.getStudent().getSid();
        this.student = examGrade.getStudent().getUser().getUsername();
        this.eid = examGrade.getExam().getEid();
        this.answer = examGrade.getAnswer();
        this.score = examGrade.getScore();
    }
}