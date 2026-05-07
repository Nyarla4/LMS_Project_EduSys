package koreanit.lms.edusys.Repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

import koreanit.lms.edusys.Entity.UserEntity;

public interface UserRepository extends JpaRepository<UserEntity, Long> {
    Optional<UserEntity> findByLoginid(String loginid);
    Optional<UserEntity> findByUsername(String username);
    Optional<UserEntity> findByEmail(String email);
}