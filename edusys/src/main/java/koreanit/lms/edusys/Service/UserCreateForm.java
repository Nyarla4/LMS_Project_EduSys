package koreanit.lms.edusys.Service;

import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserCreateForm {

    @Size(min = 3, max = 50)
    @NotEmpty(message = "로그인 ID는 필수 항목입니다.")
    private String loginid;

    @Size(min = 2, max = 50)
    @NotEmpty(message = "사용자 이름은 필수 항목입니다.")
    private String username;

    @NotEmpty(message = "비밀번호는 필수 항목입니다.")
    private String password;

    @NotEmpty(message = "비밀번호 확인은 필수 항목입니다.")
    private String passwordConfirm;

    @NotEmpty(message = "이메일은 필수 항목입니다.")
    @Email(message = "올바른 이메일 형식이 아닙니다.")
    private String email;

    @NotEmpty(message = "전화번호는 필수 항목입니다.")
    private String phonenum;

    @NotEmpty(message = "회원 유형은 필수 선택입니다.")
    private String usertype;

    private MultipartFile proofFile;
    
}