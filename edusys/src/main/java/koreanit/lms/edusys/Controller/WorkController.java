package koreanit.lms.edusys.Controller;

import koreanit.lms.edusys.Entity.Work;
import koreanit.lms.edusys.Service.WorkService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/works")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class WorkController {

    private final WorkService workService;

    @GetMapping
    public List<Work> getAllWorks() {
        return workService.findAllWorks();
    }

    @GetMapping("/{id}")
    public Work getWorkById(@PathVariable Integer id) {
        return workService.findWorkById(id)
                .orElseThrow(() -> new RuntimeException("Work not found with id: " + id));
    }

    @GetMapping("/subject/{subId}")
    public List<Work> getWorksBySubject(@PathVariable Integer subId) {
        return workService.findAllWorksBySubject(subId);
    }

    @PostMapping
    public Work saveWork(@RequestBody Work work) {
        return workService.createWork(work);
    }

    @DeleteMapping("/{id}")
    public void deleteWork(@PathVariable Integer id) {
        workService.deleteWork(id);
    }
}