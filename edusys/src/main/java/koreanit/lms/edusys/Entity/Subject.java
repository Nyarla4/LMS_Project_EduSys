package koreanit.lms.edusys.Entity;

import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;

import java.time.LocalDate;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class Subject {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer subid;

    private String major;
    private String name;
    private Integer rate;

    @OneToOne
    @JoinColumn(name = "tid")
    private Teacher teacher;
    
    private Integer capacity;
    private String planFile;//임시로 String으로 저장, 나중에 파일로 저장하는 방법으로 변경할 수 있음

    private LocalDate startDate;
    private LocalDate endDate;
}