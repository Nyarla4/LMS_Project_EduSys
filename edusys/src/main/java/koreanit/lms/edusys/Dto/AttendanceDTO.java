package koreanit.lms.edusys.Dto;

import java.time.LocalDate;
import koreanit.lms.edusys.Entity.Attendance;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class AttendanceDTO {
    private Integer aid;
    private LocalDate date;
    private Integer sid;
    private String studentName;
    private Integer subid;
    private Boolean whether;
    private Boolean isPresentByVideo;

    public AttendanceDTO(Attendance attendance) {
        this.aid = attendance.getAid();
        this.date = attendance.getDate();
        this.sid = attendance.getStudent() != null ? attendance.getStudent().getSid() : null;
        this.studentName = (attendance.getStudent() != null && attendance.getStudent().getUser() != null) ? attendance.getStudent().getUser().getUsername() : null;
        this.subid = attendance.getSubject() != null ? attendance.getSubject().getSubid() : null;
        this.whether = attendance.getWhether();
        this.isPresentByVideo = false; // 기본값
    }
}