import { COURSES } from '@data/courses'
import { supabase } from './supabase'
import { writeAssignmentsToSheet, writeTeacherToSheet } from './sheetsWriter'

// --- Google Sheets JSON parser ---
// Sheets JSON endpoint wraps response in: /*O_o*/\ngoogle.visualization.Query.setResponse({...})
// Strip the gviz wrapper and parse the inner JSON object.
// Handles two Google Sheets JSON API modes:
//   1. col.label populated for ALL columns → use labels as keys, data starts at row 0
//   2. col.label empty for some/all columns → first row is headers, data starts at row 1
function parseSheetJson(text) {
  const json = text.replace(/^[^(]+\(/, '').replace(/\);?\s*$/, '');
  const parsed = JSON.parse(json);
  const table = parsed.table;
  if (!table?.rows?.length) return [];

  const cols = table.cols;
  const firstRow = table.rows[0]?.c?.map(cell => cell?.v ?? '') || [];

  // Check if col.label is populated for ALL columns
  const labelsFromCols = cols.every(col => col.label?.trim());

  const colLabels = cols.map((col, i) => {
    const label = col.label?.trim();
    if (label) return label;
    // Fallback to first row value if it looks like a header
    const firstVal = String(firstRow[i] ?? '');
    return firstVal || col.id;
  });

  // If labels came from cols, data starts at row 0; otherwise row 0 is headers, skip it
  const startRow = labelsFromCols ? 0 : 1;

  return table.rows.slice(startRow).map(row => {
    const obj = {};
    (row.c || []).forEach((cell, i) => {
      const key = colLabels[i];
      if (key) obj[key] = cell?.v ?? null;
    });
    return obj;
  });
}

// Normalize status strings: trim + title-case to match expected values
function normalizeStatus(s) {
  if (!s || typeof s !== 'string') return 'Not Started';
  const t = s.trim().toLowerCase();
  if (t === 'completed') return 'Completed';
  if (t === 'in progress') return 'In Progress';
  if (t === 'not started') return 'Not Started';
  return s.trim();
}

// Parse human-readable dates like "March 28, 2026" → "2026-03-28" (Safari-safe)
function parseJoinDate(raw) {
  if (!raw) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  // Google Sheets date format: "Date(YYYY,M,D)" (M is 0-indexed)
  const gm = raw.match(/^Date\((\d{4}),(\d{1,2}),(\d{1,2})\)$/);
  if (gm) {
    const mo = String(parseInt(gm[2]) + 1).padStart(2, '0');
    const day = String(gm[3]).padStart(2, '0');
    return `${gm[1]}-${mo}-${day}`;
  }
  const months = {january:'01',february:'02',march:'03',april:'04',may:'05',june:'06',july:'07',august:'08',september:'09',october:'10',november:'11',december:'12'};
  const m = raw.match(/(\w+)\s+(\d+),?\s+(\d{4})/);
  if (m) {
    const mo = months[m[1].toLowerCase()] || '01';
    const day = String(m[2]).padStart(2, '0');
    return `${m[3]}-${mo}-${day}`;
  }
  return raw;
}

// --- READ: Google Sheets → React state ---

export async function fetchTeachers() {
  // Primary: Google Sheet
  const url = import.meta.env.VITE_SHEET_TEACHERS_URL;
  if (url) {
    try {
      const res = await fetch(url);
      const text = await res.text();
      const rows = parseSheetJson(text);
      if (rows.length > 0) {
        console.info(`[api] fetchTeachers: ${rows.length} from sheet`);
        return rows
          .filter(r => r.name && String(r.name).trim())
          .map(r => {
            const joinDate = parseJoinDate(String(r.joinDate || '').trim());
            return {
              id:               Number(r.teacher_id),
              name:             String(r.name).trim(),
              email:            String(r.email || '').trim(),
              phone:            String(r.phone || '—').trim(),
              vertical:         String(r.vertical || '').trim(),
              teamLead:         String(r.teamLead || '').trim(),
              region:           String(r.region || '').trim(),
              joinDate,
              status:           String(r.status || 'Active').trim(),
              adhyayanUserId:   String(r.adhyayanUserId || '').trim(),
              learningPathLink: String(r.learningPathLink || '').trim(),
            };
          });
      }
    } catch (e) {
      console.warn('[api] fetchTeachers: sheet failed, trying Supabase:', e);
    }
  }
  // Fallback: Supabase
  try {
    const { data, error } = await supabase.from('teachers').select('*');
    if (!error && data?.length > 0) {
      console.info(`[api] fetchTeachers: ${data.length} from Supabase`);
      return data
        .filter(r => r.name)
        .map(r => ({
          id:               Number(r.teacher_id),
          name:             r.name || '',
          email:            r.email || '',
          phone:            r.phone || '',
          vertical:         r.vertical || '',
          teamLead:         r.teamLead || '',
          region:           r.region || '',
          joinDate:         r.joinDate || '',
          status:           r.status || 'Active',
          adhyayanUserId:   r.adhyayanUserId || '',
          learningPathLink: r.learningPathLink || '',
        }));
    }
  } catch (e) {
    console.error('[api] fetchTeachers: both sources failed:', e);
  }
  return [];
}

export async function fetchCourses() {
  const url = import.meta.env.VITE_SHEET_COURSES_URL;
  if (!url) return COURSES;
  try {
    const res = await fetch(url);
    const text = await res.text();
    const rows = parseSheetJson(text);
    if (rows.length === 0) {
      console.info('[api] Courses sheet is empty, using hardcoded courses');
      return COURSES;
    }
    // Build a map of sheet rows keyed by courseId
    const sheetMap = new Map(rows.map(r => [String(r.courseId || '').trim(), r]));
    // Start from hardcoded COURSES — sheet overrides only specific fields
    const result = COURSES.map(hc => {
      const s = sheetMap.get(hc.id);
      if (!s) return hc;
      return {
        ...hc,
        name:               String(s.name || '').trim() || hc.name,
        cat:                (s.subject || '').toString().trim().toLowerCase() || hc.cat,
        subject:            (s.subject || '').toString().trim().toLowerCase() || hc.cat,
        adhyayanProjectId:  String(s.adhyayanProjectId || '').trim() || hc.adhyayanProjectId || '',
        modules:            parseInt(s.totalModules) || hc.modules,
        totalModules:       parseInt(s.totalModules) || hc.modules,
        status:             (s.status || '').toString().trim().toLowerCase() || hc.status,
      };
    });
    console.info(`[api] fetchCourses: ${sheetMap.size} in sheet, ${result.length} total (hardcoded base)`);
    return result;
  } catch (e) {
    console.error('[api] fetchCourses FAILED:', e);
    return COURSES;
  }
}

export async function fetchAssignments() {
  try {
    // Primary: read from Supabase (the write target)
    const { data, error } = await supabase.from('assignments').select('*');
    if (!error && data?.length > 0) {
      console.info(`[api] fetchAssignments: ${data.length} from Supabase`);
      return data.map(r => ({
        id:           r.id,
        teacherId:    Number(r.teacher_id),
        courseId:      r.course_id,
        assignedDate: r.assigned_date || '',
        deadline:     r.deadline || '',
        status:       normalizeStatus(r.status),
      }));
    }
    if (error) console.warn('[api] fetchAssignments: Supabase error, falling back to sheet:', error.message);
  } catch (e) {
    console.warn('[api] fetchAssignments: Supabase failed, falling back to sheet:', e);
  }
  // Fallback: read from Google Sheet
  try {
    const url = import.meta.env.VITE_SHEET_ASSIGNMENTS_URL;
    if (!url) return [];
    const res = await fetch(url);
    const text = await res.text();
    const rows = parseSheetJson(text);
    if (rows.length === 0) {
      console.info('[api] Assignments sheet is empty');
      return [];
    }
    console.info(`[api] fetchAssignments: ${rows.length} from sheet`);
    return rows.map(r => ({
      id:           Number(r.id),
      teacherId:    Number(r.teacherId),
      courseId:      String(r.courseId || '').trim(),
      assignedDate: parseJoinDate(String(r.assignedDate || '').trim()),
      deadline:     parseJoinDate(String(r.deadline || '').trim()),
      status:       normalizeStatus(r.status),
    })).filter(r => r.teacherId > 0 && r.courseId);
  } catch (e) {
    console.error('[api] fetchAssignments: both sources failed:', e);
    return [];
  }
}

export async function fetchProgress() {
  const url = import.meta.env.VITE_SHEET_PROGRESS_URL;
  if (!url) return [];
  try {
    const res = await fetch(url);
    const text = await res.text();
    const rows = parseSheetJson(text);
    if (rows.length === 0) return [];
    const mapped = rows
      .map(r => ({
        teacherId:        Number(r.teacherId) || 0,
        courseId:          String(r.courseId || '').trim(),
        pct:              parseFloat(r.pct) || 0,
        completionStatus: normalizeStatus(r.completionStatus),
        kc1Score:         r.kc1Score != null ? Number(r.kc1Score) : null,
        kc2Score:         r.kc2Score != null ? Number(r.kc2Score) : null,
        avgScore:         r.avgScore != null ? parseFloat(r.avgScore) : null,
        lastUpdated:      String(r.lastUpdated || '').trim(),
        adhyayanUserId:   String(r.adhyayanUserId || '').trim(),
        name:             String(r.name || '').trim(),
      }))
      .filter(r => r.teacherId > 0 || (r.adhyayanUserId && r.adhyayanUserId.length > 0));
    console.info(`[api] fetchProgress: ${rows.length} total rows, ${mapped.length} with valid teacherId`);
    if (mapped.length === 0 && rows.length > 0) {
      console.warn('[api] Progress: all rows filtered out. Check sheet column header matches exactly: teacherId');
    }
    return mapped;
  } catch (e) {
    console.error('[api] fetchProgress FAILED:', e);
    return [];
  }
}

// --- MERGE: join teachers + assignments + progress + courses ---

export function mergeData(teachers, assignments, progress, courses) {
  return assignments.map(a => {
    const teacher = teachers.find(t => t.id === a.teacherId);
    const course  = courses.find(c => c.id === a.courseId || c.courseId === a.courseId);
    // Join progress: try teacherId first, fallback to adhyayanUserId
    let prog = progress.find(p => p.teacherId === a.teacherId && p.courseId === a.courseId);
    if (!prog && teacher?.adhyayanUserId) {
      prog = progress.find(p => p.adhyayanUserId === teacher.adhyayanUserId && p.courseId === a.courseId);
    }
    return {
      ...a,
      pct:              prog?.pct ?? 0,
      completionStatus: prog?.completionStatus ?? 'Not Started',
      kc1Score:         prog?.kc1Score ?? null,
      kc2Score:         prog?.kc2Score ?? null,
      avgScore:         prog?.avgScore ?? null,
      teacherName:      teacher?.name || '',
      teacherEmail:     teacher?.email || '',
      teacherVertical:  teacher?.vertical || '',
      teacher: teacher ? {
        ...teacher,
      } : null,
      course: course || null,
    };
  }).filter(r => r.teacher && r.course);
}

// --- WRITE: Local state → Supabase ---

export async function pushTeacher(teacher) {
  try {
    // Primary: Supabase
    const { error } = await supabase.from('teachers').upsert({
      teacher_id:       teacher.id,
      name:             teacher.name,
      email:            teacher.email,
      phone:            teacher.phone || null,
      vertical:         teacher.vertical || null,
      teamLead:         teacher.teamLead || null,
      region:           teacher.region || null,
      joinDate:         teacher.joinDate || null,
      status:           teacher.status || 'Active',
      adhyayanUserId:   teacher.adhyayanUserId || null,
      learningPathLink: teacher.learningPathLink || null,
    }, { onConflict: 'teacher_id' });
    if (error) {
      console.error('[api] pushTeacher: Supabase failed:', error.message);
      return { ok: false, error: error.message };
    }
    console.info('[api] pushTeacher: Supabase success');
    // Best-effort: also write to Sheet
    await writeTeacherToSheet(teacher);
    return { ok: true };
  } catch (e) {
    console.error('[api] pushTeacher failed:', e);
    return { ok: false, error: e };
  }
}

export async function pushAssignments(assignments) {
  const pending = assignments.filter(a => a._pending);
  if (pending.length === 0) return { ok: true };
  try {
    const rows = pending.map(a => ({
      id:            a.id,
      teacher_id:    a.teacherId,
      course_id:     a.courseId,
      assigned_date: a.assignedDate,
      deadline:      a.deadline,
      status:        a.status,
    }));
    console.log('[api] pushAssignments: upserting', rows.length, 'rows to Supabase');
    const { error } = await supabase.from('assignments').upsert(rows, { onConflict: 'id', ignoreDuplicates: false });
    if (error) {
      console.error('[api] pushAssignments: Supabase failed:', error.message);
      return { ok: false, error: error.message };
    }
    console.info('[api] pushAssignments: Supabase success');
    // Best-effort: also write to Sheet so Pull-from-sheet fallback works
    await writeAssignmentsToSheet(pending);
    return { ok: true };
  } catch (e) {
    console.error('[api] pushAssignments failed:', e);
    return { ok: false, error: e };
  }
}
