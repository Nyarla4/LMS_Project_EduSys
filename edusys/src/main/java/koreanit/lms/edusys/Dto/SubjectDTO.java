package koreanit.lms.edusys.Dto;

import java.time.LocalDate;

import koreanit.lms.edusys.Entity.Subject;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
public class SubjectDTO {
    private Integer subid;
    private String major;
    private String name;    // 과목(국,영,수,사,과)
    private Integer capacity;
    private String planFile;
    // 개설 기간
    private LocalDate startDate;
    private LocalDate endDate;
    private Subject.SubStatus subStatus;
    private Integer tid; // 담당 교사 ID

    public SubjectDTO(Subject subject) {
        this.subid = subject.getSubid();
        this.major = subject.getMajor();
        this.name = subject.getName();
        this.capacity = subject.getCapacity();
        this.planFile = subject.getPlanFile();
        this.startDate = subject.getStartDate();
        this.endDate = subject.getEndDate();
        this.tid = subject.getTeacher().getTid();
        this.subStatus = subject.getSubStatus();
    }

}
