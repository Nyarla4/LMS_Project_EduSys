package koreanit.lms.edusys.User;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserDTO {
    private Long userid;

    private String loginid;
    private String email;
    private String username;
    private String phonenum;
    private String usertype;
}