package koreanit.lms.edusys.lesson;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Lob;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "lesson_videos")
@Getter
@Setter
@NoArgsConstructor
public class LessonVideo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long lessonId;
    private Integer week;
    private String title;
    private String fileUrl; // 파일 시스템 방식용
    private Integer duration; // seconds

    // BLOB 방식용 필드들 (선택적)
    @Lob
    private byte[] videoData; // 실제 파일 데이터
    private String contentType; // 파일 타입 (video/mp4 등)
    private String originalFileName; // 원본 파일명
}