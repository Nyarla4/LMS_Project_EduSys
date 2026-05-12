package koreanit.lms.edusys.Entity;

import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

import java.time.LocalDate;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "works")
@Getter
@Setter
@NoArgsConstructor
public class Work {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer wid;
    
    private String form; // 임시로 String으로 저장, 나중에 파일로 저장하는 방법으로 변경
    
    private LocalDate dueDate;

    private String grade;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subid")
    private Subject subject;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sid")
    private Student student;
}