package koreanit.lms.edusys.work;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDate;

@Entity
@Table(name = "works")
@Getter
@Setter
@NoArgsConstructor
public class Work {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String workId;
    private String title;
    private String form;
    private LocalDate dueDate;
    private String status;
    private String grade;
    private Long subjectId;
    private Long studentId;
}