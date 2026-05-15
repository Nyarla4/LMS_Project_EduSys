package koreanit.lms.edusys.Entity;

import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "progresses")
@Getter
@Setter
@NoArgsConstructor
public class Progress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer pid;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sid")
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lid")
    private Lesson lesson;

    private Integer progressed;
}