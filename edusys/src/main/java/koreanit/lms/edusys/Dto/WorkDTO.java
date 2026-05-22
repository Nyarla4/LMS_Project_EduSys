package koreanit.lms.edusys.Dto;

import java.time.LocalDate;

import koreanit.lms.edusys.Entity.Work; // Work 엔티티 임포트
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class WorkDTO {
    private Integer wid;
    private String form;
    private LocalDate dueDate;
    private String grade;
    private Integer subid;

    public WorkDTO(Work work) {
        this.wid = work.getWid();
        this.form = work.getForm();
        this.dueDate = work.getDueDate();
        this.grade = work.getGrade();
        // Subject 엔티티 전체 대신 ID만 가져와서 프록시 문제를 원천 차단합니다.
        this.subid = work.getSubject() != null ? work.getSubject().getSubid() : null;
    }
}