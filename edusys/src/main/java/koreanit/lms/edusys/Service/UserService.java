package koreanit.lms.edusys.Service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import koreanit.lms.edusys.DataNotFoundException;
import koreanit.lms.edusys.Entity.UserEntity;
import koreanit.lms.edusys.Repository.UserRepository;
import koreanit.lms.edusys.Entity.UserType;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    private final String uploadDir = Paths.get(System.getProperty("user.dir"), "Document").toString();

    public UserEntity create(UserCreateForm form) {
        UserEntity user = new UserEntity();
        user.setLoginid(form.getLoginid());
        user.setUsername(form.getUsername());
        user.setEmail(form.getEmail());
        user.setPhonenum(form.getPhonenum());

        if (form.getUsertype() != null) {
            user.setUsertype(UserType.valueOf(form.getUsertype()));
        }

        String savedFileName = saveFile(form.getProofFile());
        user.setProofFilePath(savedFileName);

        user.setPassword(passwordEncoder.encode(form.getPassword()));

        return this.userRepository.save(user);
    }

    private String saveFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return null;
        }

        try {
            File folder = new File(uploadDir);
            if (!folder.exists()) {
                folder.mkdirs();
            }

            String savedName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            File target = new File(uploadDir, savedName);
            file.transferTo(target);

            return savedName;
        } catch (IOException e) {
            throw new RuntimeException("증빙서류 저장 중 오류가 발생했습니다.", e);
        }
    }

    public UserEntity getUser(String loginid) {
        return this.userRepository.findByLoginid(loginid)
                .orElse(null);
    }

    public UserEntity getUserOrThrow(String loginid) {
        return this.userRepository.findByLoginid(loginid)
                .orElseThrow(() -> new DataNotFoundException("사용자를 찾을 수 없습니다."));
    }

    public UserDTO getUserDto(String loginid) {
        UserEntity user = this.getUserOrThrow(loginid);

        UserDTO dto = new UserDTO();
        dto.setUserid(user.getUserid());
        dto.setLoginid(user.getLoginid());
        dto.setEmail(user.getEmail());
        dto.setUsername(user.getUsername());
        dto.setPhonenum(user.getPhonenum());
        dto.setUsertype(user.getUsertype().name());

        return dto;
    }

    public List<UserDTO> getAllUsers() {
        List<UserEntity> users = this.userRepository.findAll();
        List<UserDTO> userDTOs = new ArrayList<>();
        for (UserEntity user : users) {
            if(user.getLoginid()!=null){
                UserDTO dto = getUserDto(user.getLoginid());
                userDTOs.add(dto);
            }
        }
        return userDTOs;
    }

    public UserDTO changeUser(UserEntity user) {
        if (user == null)
            return null;
        userRepository.save(user);
        UserDTO dto = new UserDTO();
        dto.setUserid(user.getUserid());
        dto.setLoginid(user.getLoginid());
        dto.setEmail(user.getEmail());
        dto.setUsername(user.getUsername());
        dto.setPhonenum(user.getPhonenum());
        dto.setUsertype(user.getUsertype().name());
        return dto;
    }

    public void changePassword(String loginId, String currentPassword, String newPassword) {
        UserEntity user = this.getUserOrThrow(loginId);

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new IllegalArgumentException("현재 비밀번호가 일치하지 않습니다.");
        }

        user.setPassword(passwordEncoder.encode(newPassword));

        this.userRepository.save(user);
    }

    public void updateUserInfo(String loginId, String newEmail, String newPhone) {
        UserEntity user = this.getUserOrThrow(loginId);

        if (newEmail != null && !newEmail.isEmpty()) {
            user.setEmail(newEmail);
        }
        if (newPhone != null && !newPhone.isEmpty()) {
            user.setPhonenum(newPhone);
        }

        this.userRepository.save(user);
    }

    @org.springframework.transaction.annotation.Transactional
    public void withdraw(String loginId) {
        UserEntity user = this.getUserOrThrow(loginId);

        if (user.getProofFilePath() != null) {
            try {
                File file = new File(uploadDir, user.getProofFilePath());
                if (file.exists()) {
                    file.delete();
                }
            } catch (Exception e) {
                System.err.println("증빙서류 파일 삭제 실패: " + e.getMessage());
            }
        }
        user.setLoginid(null);
        user.setEmail(null);
        user.setProofFilePath(null);
    }
}