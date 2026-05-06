package koreanit.lms.edusys.Controller;

import org.springframework.stereotype.Controller;

import koreanit.lms.edusys.Service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;


@Controller
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @GetMapping("user")
    public String getAllUser() {
        return "test";
    }
    
}