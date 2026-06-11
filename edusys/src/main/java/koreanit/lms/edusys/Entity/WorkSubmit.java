package koreanit.lms.edusys.Entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "work_submits")
@Getter
@Setter
@NoArgsConstructor
public class WorkSubmit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer wsid;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "wid", nullable = false)
    private Work work;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sid", nullable = false)
    private Student student;

    private String fileName; // 제출된 파일명
    
    private String grade; // 점수/평가
}