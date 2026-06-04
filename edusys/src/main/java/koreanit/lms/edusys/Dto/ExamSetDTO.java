package koreanit.lms.edusys.Dto;

import koreanit.lms.edusys.Entity.ExamSet;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
public class ExamSetDTO {
    private Integer esid;
    private String name;
    private Integer subid;
    private LocalDateTime examDate;
    private String status;
    private Integer totalScore; // 합산 점수 필드 추가

    public ExamSetDTO(ExamSet examSet) {
        if (examSet == null) return;
        this.esid = examSet.getEsid();
        this.name = examSet.getName();
        this.subid = examSet.getSubject() != null ? examSet.getSubject().getSubid() : null;
        this.examDate = examSet.getExamDate();
        
        // 상태 자동 계산
        if (this.examDate != null) {
            LocalDateTime now = LocalDateTime.now();
            if (now.isBefore(this.examDate)) {
                this.status = "시작전";
            } else if (now.isBefore(this.examDate.plusHours(2))) {
                this.status = "진행중";
            } else {
                this.status = "종료";
            }
        }
    }
}
