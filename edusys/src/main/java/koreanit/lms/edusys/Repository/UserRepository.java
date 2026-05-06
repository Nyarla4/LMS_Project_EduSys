package koreanit.lms.edusys.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import koreanit.lms.edusys.Entity.User;

public interface UserRepository extends JpaRepository<User, Integer> {

}