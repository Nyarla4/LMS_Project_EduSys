package koreanit.lms.edusys.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

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

    public List<Work> findAllWorksBySubject(Integer subid) {
        return workRepository.findBySubjectSubid(subid);
    }

    public List<Work> findAllWorksBySubjectAndDueDateBetween(Integer subid, LocalDate startDate, LocalDate endDate) {
        return workRepository.findBySubjectSubidAndDueDateBetween(subid, startDate, endDate);
    }

    public Optional<Work> findWorkById(Integer wid) {
        if(wid == null) return Optional.empty();
        return workRepository.findById(wid);
    }

    public Work createWork(Work work) {
        if(work == null) {
            return null;
        }
        return workRepository.save(work);
    }

    public void deleteWork(Integer wid) {
        if(wid == null) {
            return;
        }
        Work existingWork = workRepository.findById(wid).orElse(null);
        if (existingWork != null) {
            workRepository.delete(existingWork);
        }
    }
}