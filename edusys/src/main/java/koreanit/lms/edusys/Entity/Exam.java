package koreanit.lms.edusys.Entity;

import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "exams")
@Getter
@Setter
@NoArgsConstructor
public class Exam {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer eid;
    
    @Column(columnDefinition = "TEXT")
    private String question;// 시험문제

    @Column(nullable = false, length = 100)
    private String objectiveOption1; // 객관식 선택지 1
    @Column(nullable = false, length = 100)
    private String objectiveOption2; // 객관식 선택지 2
    @Column(nullable = false, length = 100)
    private String objectiveOption3; // 객관식 선택지 3
    @Column(nullable = false, length = 100)
    private String objectiveOption4; // 객관식 선택지 4
    
    @Column(columnDefinition = "TEXT")
    private String answer;// 정답(객관식인 경우 1,2 등, 주관식인 경우 답안)
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "esid")
    private ExamSet examSet;
}