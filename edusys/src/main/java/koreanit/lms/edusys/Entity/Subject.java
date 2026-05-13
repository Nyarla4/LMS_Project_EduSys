package koreanit.lms.edusys.Entity;

import jakarta.persistence.Id;
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

    @OneToMany(mappedBy = "subject")
    private List<Lesson> lessons;

    @OneToMany(mappedBy = "subject")
    private List<Course> courses;

    @OneToMany(mappedBy = "subject")
    private List<Attendance> attendances;

    @OneToMany(mappedBy = "subject")
    private List<Progress> progresses;

    @OneToMany(mappedBy = "subject")
    private List<Work> works;

    @OneToMany(mappedBy = "subject")
    private List<Exam> exams;

    @OneToMany(mappedBy = "subject")
    private List<Grade> grades;

    private Integer capacity;
    private String planFile;

    private LocalDate startDate;
    private LocalDate endDate;
}