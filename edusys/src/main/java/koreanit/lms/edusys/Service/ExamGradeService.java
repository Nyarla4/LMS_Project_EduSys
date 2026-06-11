package koreanit.lms.edusys.Service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import koreanit.lms.edusys.Dto.ExamGradeDTO;
import koreanit.lms.edusys.Entity.Exam;
import koreanit.lms.edusys.Entity.ExamGrade;
import koreanit.lms.edusys.Entity.Student;
import koreanit.lms.edusys.Repository.ExamGradeRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ExamGradeService {
    private final ExamGradeRepository examGradeRepository;
    private final ExamService examService;
    private final StudentService studentService;

    public List<ExamGrade> findAllExamGrades() {
        return examGradeRepository.findAll();
    }

    public List<ExamGrade> findAllExamGradesByExam(Integer eid) {
        return examGradeRepository.findByExamEid(eid);
    }

    public Optional<ExamGrade> findExamGradeById(Integer egid) {
        if(egid == null) {
            return Optional.empty();
        }
        return examGradeRepository.findById(egid);
    }

    public Optional<ExamGrade> findExamGradeByExamAndStudent(Integer eid, Integer sid) {
        return examGradeRepository.findByExamEidAndStudentSid(eid, sid);
    }

    public ExamGrade createExamGrade(Integer eid, Integer sid) {
        Optional<Exam> oExam = examService.findExamById(eid);
        if(oExam.isEmpty())
            return null;
        Exam exam = oExam.get();
        Student student = studentService.findById(sid);
        if(student == null){
            return null;
        }
        ExamGrade grade = new ExamGrade();
        grade.setExam(exam);
        grade.setStudent(student);
        grade.setAnswer("");
        grade.setScore("");
        return examGradeRepository.save(grade);
    }

    public void submitAnswer(ExamGradeDTO dto) {
        Exam exam = examService.findExamById(dto.getEid())
                .orElseThrow(() -> new RuntimeException("시험 정보를 찾을 수 없습니다. ID: " + dto.getEid()));
        
        Student student = studentService.findById(dto.getSid());
        
        // 기존 제출 내역이 있는지 확인 후 있으면 업데이트, 없으면 신규 생성
        ExamGrade grade = examGradeRepository.findByExamEidAndStudentSid(dto.getEid(), dto.getSid())
                .orElse(new ExamGrade());

        grade.setExam(exam);
        grade.setStudent(student);
        grade.setAnswer(dto.getAnswer());
        
        if (grade.getEgid() == null) grade.setScore(""); // 신규 생성시에만 점수 초기화

        // 객관식 문제의 경우 제출된 답안과 정답을 비교하여 점수 자동 채점
        if (exam.getObjectiveOption1() != null && (dto.getAnswer().contains("1"))) {
            grade.setScore("100");
        } else if (exam.getObjectiveOption2() != null && (dto.getAnswer().contains("2"))) {
            grade.setScore("100");
        } else if (exam.getObjectiveOption3() != null && (dto.getAnswer().contains("3"))) {
            grade.setScore("100");
        } else if (exam.getObjectiveOption4() != null && (dto.getAnswer().contains("4"))) {
            grade.setScore("100");
        } else {
            grade.setScore("0");
        }
        
        examGradeRepository.save(grade);
    }

    public ExamGrade answerExam(Integer egid, String answer){
        Optional<ExamGrade> oExamGrade = findExamGradeById(egid);
        if(oExamGrade.isEmpty())
            return null;
        ExamGrade examGrade = oExamGrade.get();
        examGrade.setAnswer(answer);
        return examGradeRepository.save(examGrade);
    }
    
    public ExamGrade gradeExam(Integer egid, String score){
        Optional<ExamGrade> oExamGrade = findExamGradeById(egid);
        if(oExamGrade.isEmpty())
            return null;
        ExamGrade examGrade = oExamGrade.get();
        examGrade.setScore(score);
        return examGradeRepository.save(examGrade);
    }

    // 시험 세트 내 모든 문제의 점수를 합산하여 평균(100점 만점 기준)으로 반환
    public Integer calculateTotalScore(Integer esid, Integer sid) {
        List<koreanit.lms.edusys.Entity.Exam> exams = examService.findAllExamsByExamSet(esid);
        if (exams == null || exams.isEmpty()) {
            return 0;
        }

        int total = 0;
        for (koreanit.lms.edusys.Entity.Exam exam : exams) {
            Optional<ExamGrade> grade = findExamGradeByExamAndStudent(exam.getEid(), sid);
            if (grade.isPresent() && grade.get().getScore() != null && !grade.get().getScore().isEmpty()) {
                try {
                    total += Integer.parseInt(grade.get().getScore());
                } catch (NumberFormatException ignored) {}
            }
        }
        return total / exams.size();
    }
}