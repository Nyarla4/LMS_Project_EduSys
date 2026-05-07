package koreanit.lms.edusys.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import koreanit.lms.edusys.Entity.Notice;

public interface NoticeRepository extends JpaRepository<Notice, Integer> {

}