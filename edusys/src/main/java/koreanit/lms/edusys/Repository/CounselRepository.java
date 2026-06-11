package koreanit.lms.edusys.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import koreanit.lms.edusys.Entity.Counsel;

public interface CounselRepository extends JpaRepository<Counsel, Integer> {
    List<Counsel> findByStudentSid(Integer sid);
    List<Counsel> findByTeacherTid(Integer tid);
}
