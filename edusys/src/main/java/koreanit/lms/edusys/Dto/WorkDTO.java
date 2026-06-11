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
    private String title;
    private LocalDate dueDate;
    private Integer subid;

    public WorkDTO(Work work) {
        this.wid = work.getWid();
        this.title = work.getTitle();
        this.dueDate = work.getDueDate();
        // Subject 엔티티 전체 대신 ID만 가져와서 프록시 문제를 원천 차단합니다.
        this.subid = work.getSubject() != null ? work.getSubject().getSubid() : null;
    }
}