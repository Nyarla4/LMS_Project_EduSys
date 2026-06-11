package koreanit.lms.edusys.Entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "exam_sets")
@Getter
@Setter
@NoArgsConstructor
public class ExamSet {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer esid;

    private String name; // e.g., "중간고사", "기말고사"
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subid")
    private Subject subject;
    private LocalDateTime examDate; // 시험 예정일 및 시간
    private String status; // e.g., "예정", "진행중", "완료"
}