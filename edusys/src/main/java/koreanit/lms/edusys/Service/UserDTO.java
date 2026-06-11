package koreanit.lms.edusys.Service;

import org.springframework.web.multipart.MultipartFile;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserDTO {
    private Long userid;

    private String loginid;
    private String password;
    private String email;
    private String username;
    private String phonenum;
    private String usertype;
    private String currentPassword;
    private String newPassword;
    private MultipartFile proofFile;
}