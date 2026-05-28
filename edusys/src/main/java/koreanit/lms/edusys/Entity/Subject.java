package koreanit.lms.edusys.Entity;

import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;

import java.time.LocalDate;
import java.util.List;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
    private String planFile;

    private LocalDate startDate;
    private LocalDate endDate;

    // 강의등록 후 승인여부
    public enum SubStatus {
        WAIT,
        OKAY,
        CANCEL
    }

    @Enumerated(EnumType.STRING)
    private SubStatus subStatus;

}