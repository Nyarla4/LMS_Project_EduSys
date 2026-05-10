package koreanit.lms.edusys.Entity;

import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

// 강의(수업) 엔티티
public class Lesson {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer lid;

    @ManyToOne
    @JoinColumn(name = "subid")
    private Subject subject;

    private String file;
    private String name;

    
}
