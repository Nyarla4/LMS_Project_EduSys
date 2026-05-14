package koreanit.lms.edusys.Service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import koreanit.lms.edusys.Entity.Counsel;
import koreanit.lms.edusys.Entity.Student;
import koreanit.lms.edusys.Entity.Teacher;
import koreanit.lms.edusys.Repository.CounselRepository;
import koreanit.lms.edusys.Repository.StudentRepository;
import koreanit.lms.edusys.Repository.TeacherRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CounselService {
    private final CounselRepository counselRepository;
    private final StudentRepository studentRepository;
    private final TeacherRepository TeacherRepository;

    public List<Counsel> findAllCounsels() {
        return counselRepository.findAll();
    }

    public List<Counsel> findAllByTeacher(Integer tid) {
        return counselRepository.findByTeacherTid(tid);
    }

    public List<Counsel> findAllByStudent(Integer sid) {
        return counselRepository.findByStudentSid(sid);
    }

    public Optional<Counsel> findCounselById(Integer ansid) {
        if(ansid == null) {
            return null;
        }
        return counselRepository.findById(ansid);
    }

    public Counsel createCounsel(Integer sid, Integer tid, String title, String content) {
        Counsel counsel = new Counsel();
        if(sid == null || tid == null){
            return null;
        }
        Optional<Student> oStudent = studentRepository.findById(sid);
        if(oStudent.isEmpty()){
            return null;
        }
        Optional<Teacher> oTeacher = TeacherRepository.findById(tid);
        if(oTeacher.isEmpty()){
            return null;
        }
        counsel.setStudent(oStudent.get());
        counsel.setTeacher(oTeacher.get());
        counsel.setTitle(title);
        counsel.setContent(content);
        return counselRepository.save(counsel);
    }

    public Counsel answerCounsel(Integer couid, String comment){
        if(couid == null)
             return null;
        Optional<Counsel> oCounsel = counselRepository.findById(couid);
        if(oCounsel.isEmpty())
            return null;
        Counsel counsel = oCounsel.get();
        counsel.setComment(comment);
        return counselRepository.save(counsel);
    }

    public void deleteCounsel(Integer couid) {
        if(couid == null) {
            return;
        }
        Counsel existingCounsel = counselRepository.findById(couid).orElse(null);
        if (existingCounsel != null) {
            counselRepository.delete(existingCounsel);
        }
    }
}