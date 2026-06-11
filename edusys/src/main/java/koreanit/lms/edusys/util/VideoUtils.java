package koreanit.lms.edusys.util;

import java.net.HttpURLConnection;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class VideoUtils {

    /**
     * 영상 파일의 길이를 초 단위로 반환
     * @param fileUrl 파일 URL 또는 경로
     * @return 길이(초), 실패시 null
     */
    public static Integer getDuration(String fileUrl) {
        if (fileUrl == null || fileUrl.trim().isEmpty()) {
            return null;
        }

        if (isYouTubeLink(fileUrl)) {
            return getYouTubeDuration(fileUrl);
        }

        return null;
    }

    /**
     * 유튜브 페이지 소스에서 영상 길이(초)를 추출
     */
    private static Integer getYouTubeDuration(String url) {
        try {
            java.net.URL targetUrl = new java.net.URL(url);
            HttpURLConnection conn = (HttpURLConnection) targetUrl.openConnection();
            // 유튜브 봇 감지 우회를 위한 User-Agent 설정
            conn.setRequestProperty("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36");
            
            try (java.io.BufferedReader reader = new java.io.BufferedReader(new java.io.InputStreamReader(conn.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    // 유튜브 페이지 내부 JSON 데이터에서 lengthSeconds 필드 추출
                    if (line.contains("\"lengthSeconds\":\"")) {
                        Pattern pattern = Pattern.compile("\"lengthSeconds\":\"(\\d+)\"");
                        Matcher matcher = pattern.matcher(line);
                        if (matcher.find()) {
                            return Integer.parseInt(matcher.group(1));
                        }
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("유튜브 길이 추출 실패 (URL: " + url + "): " + e.getMessage());
        }
        return 0; // 추출 실패 시 기본값 0 반환
    }

    /**
     * 유튜브 링크 여부 확인
     */
    public static boolean isYouTubeLink(String url) {
        return url != null && (url.contains("youtube.com") || url.contains("youtu.be"));
    }

    /**
     * 유튜브 영상 ID 추출
     */
    public static String getYouTubeId(String url) {
        String pattern = "(?<=watch\\?v=|/videos/|embed/|youtu.be/|/v/|/e/|watch\\?v%3D|watch\\?feature=player_embedded&v=|%2Fvideos%2F|embed%2F|youtu.be%2F|%2Fv%2F)[^#&?\\n]*";
        Pattern compiledPattern = Pattern.compile(pattern);
        Matcher matcher = compiledPattern.matcher(url);
        if (matcher.find()) {
            return matcher.group();
        }
        return null;
    }
}