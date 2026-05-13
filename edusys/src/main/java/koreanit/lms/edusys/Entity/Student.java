package koreanit.lms.edusys.Entity;

import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import java.util.List;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer sid;

    private String major;

    private Integer grade;

    @OneToOne
    @JoinColumn(name = "uid")
    private UserEntity user;

    @OneToMany(mappedBy = "student")
    private List<Course> courses;

    @OneToMany(mappedBy = "student")
    private List<Attendance> attendances;

    @OneToMany(mappedBy = "student")
    private List<Progress> progresses;

    @OneToMany(mappedBy = "student")
    private List<Work> works;

    @OneToMany(mappedBy = "student")
    private List<Grade> grades;
}