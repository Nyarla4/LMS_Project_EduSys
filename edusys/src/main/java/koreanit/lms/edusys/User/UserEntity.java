package koreanit.lms.edusys.User;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import lombok.*;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id", nullable = false, unique = true)
    private Long userid;

    @Column(name = "login_id", nullable = false, unique = true, length = 50)
    private String loginid;

    @Email
    @Column(name = "email", nullable = false, unique = true, length = 100)
    private String email;

    @Column(name = "password", nullable = false, length = 255)
    private String password;

    @Column(name = "user_name", nullable = false, length = 50)
    private String username;

    @Column(name = "phone_num", nullable = false, length = 20)
    private String phonenum;

    @Enumerated(EnumType.STRING)
    @Column(name = "user_type", nullable = false, length = 1, columnDefinition = "CHAR(1) DEFAULT 'S'") 
    private UserType usertype = UserType.S; 
    
}