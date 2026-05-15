package koreanit.lms.edusys.Dto;

import koreanit.lms.edusys.Entity.Course;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class CourseDTO {
    private Integer cid;
    private SubjectDTO subject;

    public CourseDTO(Course course) {
        this.cid = course.getCid();
        this.subject = course.getSubject() != null ? new SubjectDTO(course.getSubject()) : null;
    }
}