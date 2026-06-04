package koreanit.lms.edusys.Controller;

import koreanit.lms.edusys.Dto.WorkDTO;
import koreanit.lms.edusys.Entity.Work;
import koreanit.lms.edusys.Service.WorkService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/works")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class WorkController {

    private final WorkService workService;

    @GetMapping
    public List<WorkDTO> getAllWorks() {
        return workService.findAllWorks().stream()
                .map(WorkDTO::new)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public WorkDTO getWorkById(@PathVariable Integer id) {
        Work work = workService.findWorkById(id)
                .orElseThrow(() -> new RuntimeException("Work not found with id: " + id));
        return new WorkDTO(work);
    }

    @GetMapping("/subject/{subId}")
    public List<WorkDTO> getWorksBySubject(@PathVariable Integer subId) {
        return workService.findAllWorksBySubject(subId).stream()
                .map(WorkDTO::new)
                .collect(Collectors.toList());
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