package koreanit.lms.edusys.Entity;

import jakarta.persistence.Id;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;

import java.time.LocalDate;
import java.util.List;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
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
}