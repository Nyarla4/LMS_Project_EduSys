package koreanit.lms.edusys.work;

import koreanit.lms.edusys.work.Work;
import koreanit.lms.edusys.work.WorkService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/works")
@RequiredArgsConstructor
public class WorkController {

    private final WorkService workService;

    @GetMapping
    public List<Work> getAllWorks() {
        return workService.findAll();
    }

    @GetMapping("/{id}")
    public Work getWorkById(@PathVariable Long id) {
        return workService.findById(id)
                .orElseThrow(() -> new RuntimeException("Work not found with id: " + id));
    }

    @PostMapping
    public Work saveWork(@RequestBody Work work) {
        return workService.save(work);
    }

    @DeleteMapping("/{id}")
    public void deleteWork(@PathVariable Long id) {
        workService.deleteById(id);
    }
}