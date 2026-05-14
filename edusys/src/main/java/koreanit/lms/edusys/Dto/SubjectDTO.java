package koreanit.lms.edusys.Dto;

import java.time.LocalDate;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SubjectDTO {
    
    private String major;
    private String name;    // 과목(국,영,수,사,과)
    private Integer capacity;
    private String planFile;
    // 개설 기간
    private LocalDate startDate;
    private LocalDate endDate;

}
