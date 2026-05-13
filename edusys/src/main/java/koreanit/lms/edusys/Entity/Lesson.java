package koreanit.lms.edusys.Entity;

import jakarta.persistence.*;
import koreanit.lms.edusys.util.VideoUtils;
import lombok.*;

import java.time.LocalDate;
import java.time.temporal.WeekFields;
import java.util.Locale;

@Entity
@Getter
@Setter
@Table(name = "lessons")
@AllArgsConstructor
@NoArgsConstructor
public class Lesson {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer lid;

    private String name;
    private LocalDate date;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subid")
    private Subject subject;

    // 영상 파일 경로만 저장
    private String fileUrl;

    // DB에는 없지만 API 응답 시 순서대로 계산해서 넣어줄 필드
    @Transient
    private Integer week;

    // 나머지 정보들은 코드에서 계산
    @Transient
    public String getOriginalFileName() {
        return VideoUtils.getFileName(fileUrl);
    }

    @Transient
    public String getContentType() {
        String extension = getFileExtension();
        return VideoUtils.getContentTypeFromExtension(extension);
    }

    @Transient
    public String getFileExtension() {
        String fileName = getOriginalFileName();
        return VideoUtils.getFileExtension(fileName);
    }

    @Transient
    public Integer getDuration() {
        return VideoUtils.getDuration(fileUrl);
    }
}