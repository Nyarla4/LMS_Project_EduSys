package koreanit.lms.edusys.Service;

import java.util.List;

import org.springframework.stereotype.Service;

import koreanit.lms.edusys.Entity.Subject;
import koreanit.lms.edusys.Entity.Teacher;
import koreanit.lms.edusys.Entity.UserEntity;
import koreanit.lms.edusys.Repository.SubjectRepository;
import koreanit.lms.edusys.Repository.TeacherRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TeacherService {
    private final TeacherRepository teacherRepository;
    private final SubjectRepository subjectRepository;
    private final UserService userService;

    public List<Teacher> findAllTeachers() {
        return teacherRepository.findAll();
    }

    public Teacher findTeacherById(Integer tid) {
        if(tid == null) {
            return null;
        }
        return teacherRepository.findById(tid).orElse(null);
    }

    public Teacher findbyUserId(String loginId) {
        if(loginId == null) {
            return null;
        }
        var user = userService.getUserOrThrow(loginId); // 유저
        if(user == null) {
            return null; // 유저가 없으면 null 반환
        }
        return teacherRepository.findByUser(user).orElse(null);
    }

    public Teacher create(UserEntity user) {
        Teacher teacher = new Teacher();
        teacher.setUser(user);
        teacher.setApproved(false); // 기본적으로 승인되지 않은 상태로 생성
        return teacherRepository.save(teacher);
    }

    public List<Teacher> findUnapprovedTeachers() {
        return teacherRepository.findByApprovedFalse();
    }
    
    public List<Teacher> findApprovedTeachers() {
        return teacherRepository.findByApprovedTrue();
    }

    public Teacher approveTeacher(Long tid) {
        Teacher teacher = findTeacherById(tid.intValue());
        if (teacher != null) {
            teacher.setApproved(true);
            return teacherRepository.save(teacher);
        }
        return null;
    }

    public void changeSubject(Integer tid, Integer subid) {
        if(tid == null || subid == null) {
            return;
        }
        Subject subject = subjectRepository.findById(subid).orElse(null);
        if(subject == null) {
            return; // 과목이 없으면 null 반환
        }
        Teacher teacher = findTeacherById(tid);
        if(teacher == null) {
            return; // 교사가 없으면 null 반환
        }
        subject.setTeacher(teacher);
        subjectRepository.save(subject);
    }
}