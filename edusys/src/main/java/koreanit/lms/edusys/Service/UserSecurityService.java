package koreanit.lms.edusys.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import koreanit.lms.edusys.Entity.UserEntity;
import koreanit.lms.edusys.Entity.UserRole;
import koreanit.lms.edusys.Repository.UserRepository;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class UserSecurityService implements UserDetailsService {
    
    private final UserRepository userRepository;
    
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Optional<UserEntity> _siteUser = this.userRepository.findByLoginid(username);
        
        if(_siteUser.isEmpty()) {
            throw new UsernameNotFoundException("사용자를 찾을 수 없습니다.");
        }
        
        UserEntity siteUser = _siteUser.get();
        List<GrantedAuthority> authorities = new ArrayList<>();
        
        if ("admin".equals(siteUser.getLoginid())) {
            authorities.add(new SimpleGrantedAuthority(UserRole.ADMIN.getValue()));
        } else {
            authorities.add(new SimpleGrantedAuthority(UserRole.USER.getValue()));
        }
        
        return new User(siteUser.getLoginid(), siteUser.getPassword(), authorities);
    }
}