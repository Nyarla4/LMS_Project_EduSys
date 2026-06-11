package koreanit.lms.edusys.Dto;

import koreanit.lms.edusys.Entity.Exam;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ExamDTO {
    private Integer eid;
    private Integer esid;

    private String question;
    private String answer;
    private String objectiveOption1;
    private String objectiveOption2;
    private String objectiveOption3;
    private String objectiveOption4;
    
    public ExamDTO(Exam exam) {
        this.eid = exam.getEid();
        this.question = exam.getQuestion();
        this.answer = exam.getAnswer();
        this.esid = exam.getExamSet() != null ? exam.getExamSet().getEsid() : null;
        this.objectiveOption1 = exam.getObjectiveOption1();
        this.objectiveOption2 = exam.getObjectiveOption2();
        this.objectiveOption3 = exam.getObjectiveOption3();
        this.objectiveOption4 = exam.getObjectiveOption4();
    }
}