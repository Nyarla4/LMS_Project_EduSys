package koreanit.lms.edusys.Dto;

//import java.time.LocalDate;

import lombok.Getter;
import lombok.Setter;


@Getter
@Setter
public class LessonDTO {
    
    private String name;    // 세부과목 
    // 영상 파일 경로(문서 파일은 추후 컬럼추가 고려)
    private String fileUrl; 
    //private LocalDate date;

}
