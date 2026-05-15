package koreanit.lms.edusys.Entity;

import jakarta.persistence.Id;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Teacher {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer tid;

    @OneToOne
    @JoinColumn(name = "uid")
    private UserEntity user;

    private boolean approved; // 승인 여부

    private String approveString; // 승인 판단을 위한 데이터
}