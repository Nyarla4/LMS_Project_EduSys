package koreanit.lms.edusys.Service;

import java.util.List;

import org.springframework.stereotype.Service;

import koreanit.lms.edusys.Entity.Teacher;
import koreanit.lms.edusys.Repository.TeacherRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TeacherService {
    private final TeacherRepository teacherRepository;
    private final UserService userService;

    public List<Teacher> findAllTeachers() {
        return teacherRepository.findAll();
    }

    public Teacher findTeacherById(Integer tid) {
        return teacherRepository.findById(tid).orElse(null);
    }

    public Teacher findbyUserId(Long uid) {
        var user = userService.findUserById(uid); // 유저
        if(user == null) {
            return null; // 유저가 없으면 null 반환
        }
        return teacherRepository.findByUser(user).orElse(null);
    }
}