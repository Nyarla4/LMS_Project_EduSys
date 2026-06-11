package koreanit.lms.edusys.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import koreanit.lms.edusys.Entity.Course;

public interface CourseRepository extends JpaRepository<Course, Integer> {
    List<Course> findByStudentSid(Integer sid);
    List<Course> findBySubjectSubid(Integer subid);
}
