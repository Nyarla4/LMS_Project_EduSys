package koreanit.lms.edusys.Service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;

import koreanit.lms.edusys.Entity.Work;
import koreanit.lms.edusys.Repository.WorkRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class WorkService {
    private final WorkRepository workRepository;

    public List<Work> findAllWorks() {
        return workRepository.findAll();
    }

    public List<Work> findAllWorksByStudent(Integer sid) {
        return workRepository.findByStudentSid(sid);
    }

    public List<Work> findAllWorksBySubject(Integer subid) {
        return workRepository.findBySubjectSubid(subid);
    }

    public List<Work> findAllWorksBySubjectAndDueDateBetween(Integer subid, LocalDate startDate, LocalDate endDate) {
        return workRepository.findBySubjectSubidAndDueDateBetween(subid, startDate, endDate);
    }
}