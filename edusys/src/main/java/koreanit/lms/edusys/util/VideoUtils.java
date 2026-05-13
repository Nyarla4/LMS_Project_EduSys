package koreanit.lms.edusys.util;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.concurrent.TimeUnit;

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

        try {
            // URL에서 실제 파일 경로로 변환
            String filePath;
            if (fileUrl.startsWith("/api/files/videos/")) {
                String fileName = fileUrl.substring("/api/files/videos/".length());
                filePath = "uploads/videos/" + fileName;
            } else {
                filePath = fileUrl;
            }

            File videoFile = new File(filePath);
            if (!videoFile.exists()) {
                return null;
            }

            // FFmpeg를 사용하여 duration 추출 시도
            return getDurationWithFFmpeg(filePath);

        } catch (Exception e) {
            System.err.println("Failed to get video duration for: " + fileUrl + ", error: " + e.getMessage());
            // FFmpeg 실패시 기본값 반환 (실제로는 수동 입력 필요)
            return null;
        }
    }

    /**
     * FFmpeg를 사용하여 영상 길이 추출
     */
    private static Integer getDurationWithFFmpeg(String filePath) {
        try {
            // FFmpeg 명령어 실행
            ProcessBuilder processBuilder = new ProcessBuilder(
                "ffprobe",
                "-v", "quiet",
                "-print_format", "json",
                "-show_format",
                "-show_streams",
                filePath
            );

            Process process = processBuilder.start();
            String output = new String(process.getInputStream().readAllBytes());
            String errorOutput = new String(process.getErrorStream().readAllBytes());

            // 프로세스 종료 대기
            if (process.waitFor(10, TimeUnit.SECONDS)) {
                // JSON 파싱하여 duration 추출
                if (output.contains("\"duration\":")) {
                    int durationIndex = output.indexOf("\"duration\":");
                    if (durationIndex > 0) {
                        int startQuote = output.indexOf("\"", durationIndex + 12);
                        int endQuote = output.indexOf("\"", startQuote + 1);
                        if (startQuote > 0 && endQuote > startQuote) {
                            String durationStr = output.substring(startQuote + 1, endQuote);
                            double duration = Double.parseDouble(durationStr);
                            return (int) Math.round(duration);
                        }
                    }
                }
            }

        } catch (Exception e) {
            // FFmpeg가 설치되지 않았거나 실행 실패
            System.err.println("FFmpeg not available or failed: " + e.getMessage());
        }

        return null;
    }

    /**
     * 파일 경로에서 파일명을 추출
     * @param fileUrl 파일 URL
     * @return 파일명
     */
    public static String getFileName(String fileUrl) {
        if (fileUrl == null) return null;
        return Paths.get(fileUrl).getFileName().toString();
    }

    /**
     * 파일명에서 확장자를 추출
     * @param fileName 파일명
     * @return 확장자 (소문자)
     */
    public static String getFileExtension(String fileName) {
        if (fileName == null) return "";
        int lastDotIndex = fileName.lastIndexOf('.');
        return lastDotIndex > 0 ? fileName.substring(lastDotIndex + 1).toLowerCase() : "";
    }

    /**
     * 확장자로부터 Content-Type을 결정
     * @param extension 파일 확장자
     * @return Content-Type
     */
    public static String getContentTypeFromExtension(String extension) {
        if (extension == null) return "application/octet-stream";

        switch (extension.toLowerCase()) {
            case "mp4": return "video/mp4";
            case "avi": return "video/x-msvideo";
            case "mov": return "video/quicktime";
            case "wmv": return "video/x-ms-wmv";
            case "flv": return "video/x-flv";
            case "webm": return "video/webm";
            case "mkv": return "video/x-matroska";
            case "m4v": return "video/x-m4v";
            default: return "application/octet-stream";
        }
    }
}