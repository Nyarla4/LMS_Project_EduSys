package koreanit.lms.edusys.Dto;

import java.time.LocalDate;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LessonSubResponseDTO {
    
    // 수강신청 카드에 나타낼 정보들
    private Integer subid;
    private String teacherName;
    private String major;
    // 과목(국,영,수,사,과)
    private String subName;
    // 수강인원   
    private Integer capacity;
    // 개설 기간
    private LocalDate startDate;
    private LocalDate endDate;
    // 세부과목
    private String lessonName;

}
