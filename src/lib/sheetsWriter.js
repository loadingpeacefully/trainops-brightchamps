export async function writeAssignmentsToSheet(assignments) {
  const url = import.meta.env.VITE_SHEET_WRITER_URL;
  if (!url) {
    console.warn('[sheets] VITE_SHEET_WRITER_URL not set, skipping sheet write');
    return false;
  }
  try {
    const rows = assignments.map(a => ({
      id: a.id,
      teacherId: a.teacherId,
      courseId: a.courseId,
      assignedDate: a.assignedDate,
      deadline: a.deadline,
      status: a.status,
    }));
    await fetch(url, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action: 'upsertAssignments', rows }),
    });
    console.log('[sheets] assignments write sent (no-cors, assuming success)');
    return true;
  } catch (err) {
    console.error('[sheets] assignments write failed:', err);
    return false;
  }
}

// NOTE: The Apps Script doPost must handle action:'upsertTeacher'
// to write teacher rows to the Teachers tab.
export async function writeTeacherToSheet(teacher) {
  const url = import.meta.env.VITE_SHEET_WRITER_URL;
  if (!url) {
    console.warn('[sheets] VITE_SHEET_WRITER_URL not set, skipping teacher write');
    return false;
  }
  try {
    await fetch(url, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({
        action: 'upsertTeacher',
        row: {
          teacher_id: teacher.id,
          name: teacher.name,
          email: teacher.email,
          phone: teacher.phone || '',
          vertical: teacher.vertical || '',
          teamLead: teacher.teamLead || '',
          region: teacher.region || '',
          joinDate: teacher.joinDate || '',
          status: teacher.status || 'Active',
        },
      }),
    });
    console.log('[sheets] teacher write sent (no-cors, assuming success)');
    return true;
  } catch (err) {
    console.error('[sheets] teacher write failed:', err);
    return false;
  }
}
