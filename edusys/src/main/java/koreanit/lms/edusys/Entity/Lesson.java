package koreanit.lms.edusys.Entity;

import jakarta.persistence.*;
import koreanit.lms.edusys.util.VideoUtils;
import lombok.*;

import java.time.LocalDate;

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

    // 유튜브 API 등을 통해 영상 길이를 실시간으로 가져옴
    @Transient
    @com.fasterxml.jackson.annotation.JsonProperty("duration")
    public Integer getDuration() {
        try {
            if (fileUrl == null) return 0;
            return VideoUtils.getDuration(fileUrl);
        } catch (Exception e) {
            return 0; // 정보를 가져올 수 없으면 0으로 반환
        }
    }
}
