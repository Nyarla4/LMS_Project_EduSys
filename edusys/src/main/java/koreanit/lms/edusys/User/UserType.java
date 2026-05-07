package koreanit.lms.edusys.User;

public enum UserType {
    A("Admin"),
    S("Student(학생)"),
    T("Teacher(교사)");

    private final String description;

    UserType(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
