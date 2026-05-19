export function getPersonName(
  person: any,
  fallback = "Profile",
): string {
  if (!person || typeof person !== "object") {
    return fallback;
  }

  const name =
    person.full_name ??
    person.name ??
    [person.first_name, person.last_name].filter(Boolean).join(" ");

  return typeof name === "string" && name.trim().length > 0
    ? name.trim()
    : fallback;
}

export function getInitials(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }

  return name.slice(0, 2).toUpperCase();
}

export function getSelectedStudent(selectData: any): any | null {
  return selectData?.data?.student ?? null;
}

export function getStudentSchoolName(
  student: any,
  studentsList: any[] = [],
  schools: any[] = [],
): string {
  if (!student || typeof student !== "object") {
    return "School not available";
  }

  const embeddedSchool = student.school;
  const fromStudent =
    typeof embeddedSchool === "string"
      ? embeddedSchool
      : (embeddedSchool?.name ??
        embeddedSchool?.title ??
        student.school_name);

  if (fromStudent != null && String(fromStudent).trim() !== "") {
    return String(fromStudent);
  }

  const matchedStudent = studentsList.find(
    (item) => String(item?.id) === String(student.id),
  );

  if (matchedStudent) {
    const school = matchedStudent.school;
    const matchedName =
      typeof school === "string"
        ? school
        : (school?.name ?? school?.title ?? matchedStudent.school_name);

    if (matchedName != null && String(matchedName).trim() !== "") {
      return String(matchedName);
    }
  }

  const schoolRecord = schools.find(
    (item) => String(item?.id) === String(student.school_id),
  );

  if (schoolRecord?.name) {
    return String(schoolRecord.name);
  }

  return "School not available";
}

/** Maps enrollment from GET /students/:id/profile into display lines. */
export function getEnrollmentSummary(enrollment: unknown): string {
  if (!enrollment || typeof enrollment !== "object") {
    return "";
  }

  const e = enrollment as Record<string, unknown>;
  const classObj = e.class as Record<string, unknown> | undefined;

  const className =
    typeof classObj?.name === "string" ? classObj.name : undefined;
  const classCode =
    typeof classObj?.code === "string" ? classObj.code : undefined;
  const room =
    typeof classObj?.room === "string" ? classObj.room : undefined;
  const grade = classObj?.grade as { name?: string } | undefined;
  const gradeName = grade?.name;
  const year = classObj?.academic_year as { name?: string } | undefined;
  const yearName = year?.name;

  const roll =
    typeof e.roll_number === "string" && e.roll_number.trim() !== ""
      ? `Roll ${e.roll_number}`
      : "";
  const enrolStatus =
    typeof e.status === "string" && e.status.trim() !== ""
      ? `${e.status}`
      : "";

  const classParts = [className, classCode ? `(${classCode})` : undefined]
    .filter(Boolean)
    .join(" ");

  const parts = [
    classParts || undefined,
    gradeName,
    yearName && `Year ${yearName}`,
    room,
    roll,
    enrolStatus && `Enrollment: ${enrolStatus}`,
  ].filter(Boolean) as string[];

  return parts.join(" · ");
}

export function getProfileField(
  value: unknown,
  fallback = "Not available",
): string {
  if (value == null) {
    return fallback;
  }

  const text = String(value).trim();
  return text.length > 0 ? text : fallback;
}
