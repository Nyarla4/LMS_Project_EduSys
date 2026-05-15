package koreanit.lms.edusys.Controller;

import koreanit.lms.edusys.Dto.AttendanceDTO;
import koreanit.lms.edusys.Entity.Attendance;
import koreanit.lms.edusys.Service.AttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/attendances")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class AttendanceController {

    private final AttendanceService attendanceService;

    @GetMapping
    public List<AttendanceDTO> getAllAttendances() {
        return attendanceService.findAllAttendances().stream()
                .map(AttendanceDTO::new)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public AttendanceDTO getAttendanceById(@PathVariable Integer id) {
        Attendance att = attendanceService.findAttendanceById(id)
                .orElseThrow(() -> new RuntimeException("Attendance not found"));
        return new AttendanceDTO(att);
    }

    @GetMapping("/subject/{subId}")
    public List<AttendanceDTO> getAttendancesBySubject(@PathVariable Integer subId) {
        return attendanceService.findAllAttendancesBySubject(subId).stream()
                .map(AttendanceDTO::new)
                .collect(Collectors.toList());
    }

    @PostMapping
    public Attendance saveAttendance(@RequestBody Attendance attendance) {
        return attendanceService.save(attendance);
    }

    @DeleteMapping("/{id}")
    public void deleteAttendance(@PathVariable Integer id) {
        attendanceService.deleteById(id);
    }
}