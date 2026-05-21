package koreanit.lms.edusys.Repository;

import koreanit.lms.edusys.Entity.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LessonRepository extends JpaRepository<Lesson, Integer> {
    // 특정 과목(subid)에서 현재 lid보다 작거나 같은 강의의 개수를 조회 (즉, 순서 계산)
    long countBySubjectSubidAndLidLessThanEqual(Integer subid, Integer lid);

    // 과목 ID로 강의 목록을 찾는 메서드 추가
    List<Lesson> findBySubjectSubid(Integer subid);

    // 교사 ID로 담당하는 모든 과목의 강의 목록을 찾는 메서드 추가
    List<Lesson> findBySubjectTeacherTid(Integer tid);
}
