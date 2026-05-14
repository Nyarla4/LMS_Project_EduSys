package koreanit.lms.edusys.Dto;

import java.time.LocalDate;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LessonSubDTO {
    
    // LessonDTO, SubjectDTO 통합 강의 등록시 필요한 정보들
    private String major;
    // 과목(국,영,수,사,과)
    private String subName;    
    private Integer capacity;
    private String planFile;
    // 개설 기간
    private LocalDate startDate;
    private LocalDate endDate;
    // 세부과목
    private String lessonName;     
    // 영상 파일 경로(문서 파일은 추후 컬럼추가 고려)
    private String fileUrl;

}
