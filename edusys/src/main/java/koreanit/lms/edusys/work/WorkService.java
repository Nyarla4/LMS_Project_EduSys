package koreanit.lms.edusys.work;

import koreanit.lms.edusys.work.Work;
import koreanit.lms.edusys.work.WorkRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class WorkService {
    private final WorkRepository workRepository;

    public List<Work> findAll() {
        return workRepository.findAll();
    }

    public Optional<Work> findById(Long id) {
        return workRepository.findById(id);
    }

    public Work save(Work work) {
        return workRepository.save(work);
    }

    public void deleteById(Long id) {
        workRepository.deleteById(id);
    }
}