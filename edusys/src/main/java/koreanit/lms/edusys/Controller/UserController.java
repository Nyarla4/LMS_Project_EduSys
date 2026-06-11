package koreanit.lms.edusys.Controller;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import koreanit.lms.edusys.DataNotFoundException;
import koreanit.lms.edusys.Entity.UserEntity;
import koreanit.lms.edusys.Entity.UserType;
import koreanit.lms.edusys.Service.UserService;
import koreanit.lms.edusys.Service.StudentService;
import koreanit.lms.edusys.Service.SubjectService;
import koreanit.lms.edusys.Service.TeacherService;
import koreanit.lms.edusys.Service.UserCreateForm;
import koreanit.lms.edusys.Service.UserDTO;
import koreanit.lms.edusys.config.JwtTokenProvider;
import lombok.RequiredArgsConstructor;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RequiredArgsConstructor
@RestController
@RequestMapping("/user")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    private final UserService userService;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;
    private final StudentService studentService;
    private final TeacherService teacherService;
    private final SubjectService subjectService;

    @PostMapping(value = "/signup", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> signup(@Valid @ModelAttribute UserCreateForm userCreateForm, BindingResult bindingResult) {
        Map<String, String> response = new HashMap<>();

        if (bindingResult.hasErrors()) {
            return ResponseEntity.badRequest().body(bindingResult.getAllErrors());
        }

        if (!userCreateForm.getPassword().equals(userCreateForm.getPasswordConfirm())) {
            response.put("message", "2개의 비밀번호가 일치하지 않습니다.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        if (userCreateForm.getProofFile() == null || userCreateForm.getProofFile().isEmpty()) {
            response.put("message", "증빙서류를 반드시 첨부해야 합니다.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        try {
            UserEntity user = userService.create(userCreateForm);
            response.put("message", "회원가입이 완료되었습니다.");

            switch (userCreateForm.getUsertype()) {
                case "S":
                    studentService.create(user);
                    break;
                case "T":
                    teacherService.create(user);
                    break;
                default:
                    break;
            }
            return ResponseEntity.ok(response);
        } catch (DataIntegrityViolationException e) {
            response.put("message", "이미 등록된 사용자 아이디 또는 이메일입니다.");
            return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
        } catch (Exception e) {
            response.put("message", "회원가입 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> user) {
        Map<String, Object> response = new HashMap<>();
        String loginId = user.get("loginid") != null ? user.get("loginid") : user.get("loginId");

        UserEntity member = userService.getUser(loginId);

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

    @GetMapping("/entity")
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        List<UserDTO> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @PutMapping("/{loginId}/type")
    public ResponseEntity<UserDTO> changeUserType(@PathVariable String loginId, @RequestBody UserDTO dto) {
        UserEntity user = userService.getUser(loginId);
        if (user == null)
            return ResponseEntity.notFound().build();
        UserType newType = dto.getUsertype().contains("S") ? UserType.S
                : dto.getUsertype().contains("T") ? UserType.T : UserType.A;
        user.setUsertype(newType);
        if (newType == UserType.S) {
            if (studentService.findbyUserId(loginId) == null) {
                studentService.create(user);
            }
        }
        if (newType == UserType.T) {
            if (teacherService.findbyUserId(loginId) == null) {
                teacherService.create(user);
            }
        }
        userService.changeUser(user);
        return ResponseEntity.ok(dto);
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(
            @RequestHeader("Authorization") String token,
            @RequestBody UserDTO dto) {

        Map<String, String> response = new HashMap<>();

        try {
            String jwtToken = token.replace("Bearer ", "").trim();

            String loginId = jwtTokenProvider.getUserPk(jwtToken);

            userService.changePassword(loginId, dto.getCurrentPassword(), dto.getNewPassword());

            response.put("message", "비밀번호가 성공적으로 변경되었습니다.");
            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        } catch (Exception e) {
            response.put("message", "비밀번호 변경 중 서버 내부 오류가 발생했습니다.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PutMapping("/update-info")
    public ResponseEntity<?> updateUserInfo(
            @RequestHeader("Authorization") String token,
            @RequestBody UserDTO dto) {

        Map<String, String> response = new HashMap<>();

        try {
            String jwtToken = token.replace("Bearer ", "").trim();
            String loginId = jwtTokenProvider.getUserPk(jwtToken);

            userService.updateUserInfo(loginId, dto.getEmail(), dto.getPhonenum());

            response.put("message", "회원 정보가 성공적으로 수정되었습니다.");
            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        } catch (Exception e) {
            response.put("message", "정보 수정 중 서버 내부 오류가 발생했습니다.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @DeleteMapping("/withdraw")
    public ResponseEntity<?> withdrawUser(@RequestHeader("Authorization") String token) {
        Map<String, String> response = new HashMap<>();

        try {
            String jwtToken = token.replace("Bearer ", "").trim();
            String loginId = jwtTokenProvider.getUserPk(jwtToken);

            UserEntity user = userService.getUserOrThrow(loginId);

            if (user.getUsertype() == UserType.T) {
                koreanit.lms.edusys.Entity.Teacher teacher = teacherService.findbyUserId(loginId);
                if (teacher != null) {
                    List<koreanit.lms.edusys.Entity.Subject> subjects = subjectService
                            .findSubjectsByTeacherId(teacher.getTid());

                    if (subjects != null && !subjects.isEmpty()) {
                        response.put("message", "현재 담당 중인 과목이 " + subjects.size() + "개 있습니다. 과목을 먼저 정리해 주세요.");
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
                    }
                }
            }

            userService.withdraw(loginId);

            response.put("message", "회원 탈퇴가 안전하게 처리되었습니다.");
            return ResponseEntity.ok(response);

        } catch (DataNotFoundException e) {
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } catch (Exception e) {
            response.put("message", "회원 탈퇴 중 서버 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}