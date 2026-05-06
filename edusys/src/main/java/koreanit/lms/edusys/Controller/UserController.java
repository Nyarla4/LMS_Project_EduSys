package koreanit.lms.edusys.Controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;

import koreanit.lms.edusys.Entity.User;
import koreanit.lms.edusys.Service.UserService;
import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {
    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userService.findAllUsers(); // 서비스에서 리스트를 가져옴

        if (users.isEmpty()) {
            return ResponseEntity.noContent().build(); // 데이터가 없으면 204 No Content
        }

        return ResponseEntity.ok(users); // 데이터와 함께 200 OK 전송
    }
    
    @GetMapping("/{uid}")
    public ResponseEntity<User> getUserById(@PathVariable Long uid) {
        User user = userService.findUserById(uid); // 서비스에서 특정 유저를 가져옴

        if (user == null) {
            return ResponseEntity.notFound().build(); // 유저가 없으면 404 Not Found
        }

        return ResponseEntity.ok(user); // 데이터와 함께 200 OK 전송
    }
}