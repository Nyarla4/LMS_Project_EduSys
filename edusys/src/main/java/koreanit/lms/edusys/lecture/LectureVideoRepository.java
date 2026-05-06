package koreanit.lms.edusys.lecture;

import koreanit.lms.edusys.lecture.LectureVideo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LectureVideoRepository extends JpaRepository<LectureVideo, Long> {
}
