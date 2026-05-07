package koreanit.lms.edusys.Service;

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