package koreanit.lms.edusys.Entity;

import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

// 수강 테이블 엔티티
public class Course {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer cid;

    @ManyToOne
    @JoinColumn(name = "sid")
    private Student student;

    @ManyToOne
    @JoinColumn(name = "subid")
    private Subject subject;

}
