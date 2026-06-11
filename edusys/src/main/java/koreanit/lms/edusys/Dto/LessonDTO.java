package koreanit.lms.edusys.Dto;

import java.time.LocalDate;
import koreanit.lms.edusys.Entity.Lesson;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
public class LessonDTO {
    private Integer lid;
    private String name;    // 세부과목 
    private String fileUrl; 
    private LocalDate date;
    private Integer week;
    private Integer duration;
    private Integer subid;

    public LessonDTO(Lesson lesson) {
        this.lid = lesson.getLid();
        this.name = lesson.getName();
        this.fileUrl = lesson.getFileUrl();
        this.date = lesson.getDate();
        this.week = lesson.getWeek();
        this.duration = lesson.getDuration();
        this.subid = lesson.getSubject() != null ? lesson.getSubject().getSubid() : null;
    }
}
