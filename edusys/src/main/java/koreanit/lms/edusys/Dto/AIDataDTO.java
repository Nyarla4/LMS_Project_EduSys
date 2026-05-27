package koreanit.lms.edusys.Dto;

import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
// 파이썬 서버로 보낼 요청 데이터 클래스
public class AIDataDTO {
    private Integer subid;
    private String subjectName;
    private List<String> lessonUrl;
}