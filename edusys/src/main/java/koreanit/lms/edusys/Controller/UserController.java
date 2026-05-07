package koreanit.lms.edusys.Controller;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import koreanit.lms.edusys.Entity.UserEntity;
import koreanit.lms.edusys.Service.UserService;
import koreanit.lms.edusys.User.JwtTokenProvider;
import koreanit.lms.edusys.User.UserCreateForm;
import koreanit.lms.edusys.User.UserDTO;
import lombok.RequiredArgsConstructor;

import java.util.HashMap;
import java.util.Map;


@RequiredArgsConstructor
@RestController
@RequestMapping("/user")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    private final UserService userService;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@Valid @RequestBody UserCreateForm userCreateForm, BindingResult bindingResult) {
        Map<String, String> response = new HashMap<>();

        if (bindingResult.hasErrors()) {
            return ResponseEntity.badRequest().body(bindingResult.getAllErrors());
        }

        if (!userCreateForm.getPassword().equals(userCreateForm.getPasswordConfirm())) {
            response.put("message", "2개의 비밀번호가 일치하지 않습니다.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        try {
            userService.create(userCreateForm);
            response.put("message", "회원가입이 완료되었습니다.");
            return ResponseEntity.ok(response);
        } catch (DataIntegrityViolationException e) {
            response.put("message", "이미 등록된 사용자 아이디 또는 이메일입니다.");
            return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
        } catch (Exception e) {
            response.put("message", "회원가입 중 오류가 발생했습니다.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> user) {
        Map<String, Object> response = new HashMap<>();

        UserEntity member = userService.getUser(user.get("loginid"));
        
        if (member == null || !passwordEncoder.matches(user.get("password"), member.getPassword())) {
            response.put("message", "아이디 또는 비밀번호가 잘못되었습니다.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        String token = jwtTokenProvider.createToken(member.getLoginid());
        
        response.put("token", token);
        response.put("username", member.getUsername());
        response.put("loginId", member.getLoginid());
        response.put("message", "로그인 성공");

        return ResponseEntity.ok(response);
    }

    @GetMapping("/entity/{uid}")
    public ResponseEntity<UserDTO> getUserEntity(@PathVariable String uid) {
        UserDTO user = userService.getUserDto(uid);
        return ResponseEntity.ok(user);
    }
    
}