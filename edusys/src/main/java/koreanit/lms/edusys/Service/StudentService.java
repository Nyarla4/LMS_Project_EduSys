package koreanit.lms.edusys.Service;

import org.springframework.stereotype.Service;

import koreanit.lms.edusys.Entity.Student;
import koreanit.lms.edusys.Repository.StudentRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class StudentService {
    private final StudentRepository studentRepository;
    private final UserService userService;

    public Student findbyUserId(String loginId) {
        var user = userService.getUserOrThrow(loginId); // 유저
        if(user == null) {
            return null; // 유저가 없으면 null 반환
        }
        return studentRepository.findByUser(user).orElse(null);
    }

    public Student findById(Integer sid) {
        if(sid == null) {
            return null;
        }
        return studentRepository.findById(sid).orElse(null);
    }
}