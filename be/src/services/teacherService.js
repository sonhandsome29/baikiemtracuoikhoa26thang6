const { randomInt, randomUUID } = require("crypto");
const storageService = require("./storageService");
const { getHighestEducation, normalizeEducations } = require("../utils/education");
const {
  normalizeEmail,
  normalizeText,
  sanitizeBoolean,
} = require("../utils/text");

function createTeacherCode(existingCodes) {
  let code = "";

  do {
    code = Array.from({ length: 10 }, () => randomInt(0, 10)).join("");
  } while (existingCodes.has(code));

  return code;
}

function mapTeacherForList(teacher, positionsMap) {
  const highestEducation = getHighestEducation(teacher.educations);
  const position = positionsMap.get(teacher.teacherPositionId) || null;

  return {
    id: teacher.id,
    avatar: teacher.avatar || "",
    code: teacher.code,
    name: teacher.name,
    email: teacher.email,
    phoneNumber: teacher.phoneNumber,
    address: teacher.address,
    identity: teacher.identity,
    dob: teacher.dob,
    isActive: teacher.isActive,
    role: teacher.role,
    teacherPosition: position
      ? {
          id: position.id,
          code: position.code,
          name: position.name,
        }
      : null,
    educations: teacher.educations,
    highestEducation: highestEducation
      ? {
          level: highestEducation.level,
          school: highestEducation.school,
          major: highestEducation.major,
          status: highestEducation.status,
          graduatedAt: highestEducation.graduatedAt,
        }
      : null,
  };
}

function validateTeacherPayload(payload, teachers, positions) {
  const requiredFields = [
    { key: "name", label: "Ho va ten" },
    { key: "email", label: "Email" },
    { key: "phoneNumber", label: "So dien thoai" },
    { key: "address", label: "Dia chi" },
    { key: "identity", label: "So CCCD" },
    { key: "dob", label: "Ngay sinh" },
    { key: "teacherPositionId", label: "Vi tri cong tac" },
  ];

  for (const field of requiredFields) {
    if (!normalizeText(payload[field.key])) {
      return `${field.label} la truong bat buoc.`;
    }
  }

  const email = normalizeEmail(payload.email);
  const duplicatedEmail = teachers.some(
    (teacher) => !teacher.isDeleted && normalizeEmail(teacher.email) === email
  );

  if (duplicatedEmail) {
    return "Email giao vien phai la duy nhat.";
  }

  const matchedPosition = positions.find(
    (position) =>
      !position.isDeleted && position.id === normalizeText(payload.teacherPositionId)
  );

  if (!matchedPosition) {
    return "Vi tri cong tac khong ton tai.";
  }

  return null;
}

async function listTeachers(searchParams) {
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.max(1, Number(searchParams.get("limit")) || 10);

  const [teachers, positions] = await Promise.all([
    storageService.getTeachers(),
    storageService.getTeacherPositions(),
  ]);

  const activeTeachers = teachers.filter((teacher) => !teacher.isDeleted);
  const positionsMap = new Map(
    positions
      .filter((position) => !position.isDeleted)
      .map((position) => [position.id, position])
  );

  const mappedTeachers = activeTeachers.map((teacher) =>
    mapTeacherForList(teacher, positionsMap)
  );

  const totalItems = mappedTeachers.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * limit;

  return {
    data: mappedTeachers.slice(startIndex, startIndex + limit),
    pagination: {
      page: currentPage,
      limit,
      totalItems,
      totalPages,
    },
  };
}

async function createTeacher(payload) {
  const [teachers, positions] = await Promise.all([
    storageService.getTeachers(),
    storageService.getTeacherPositions(),
  ]);

  const validationError = validateTeacherPayload(payload, teachers, positions);
  if (validationError) {
    return { error: validationError };
  }

  const existingCodes = new Set(teachers.map((teacher) => teacher.code));
  const teacher = {
    id: randomUUID(),
    avatar: normalizeText(payload.avatar),
    code: createTeacherCode(existingCodes),
    name: normalizeText(payload.name),
    email: normalizeEmail(payload.email),
    phoneNumber: normalizeText(payload.phoneNumber),
    address: normalizeText(payload.address),
    identity: normalizeText(payload.identity),
    dob: normalizeText(payload.dob),
    isActive: sanitizeBoolean(payload.isActive, true),
    isDeleted: false,
    role: "TEACHER",
    teacherPositionId: normalizeText(payload.teacherPositionId),
    educations: normalizeEducations(payload.educations),
  };

  await storageService.createTeacher(teacher);

  const positionsMap = new Map(
    positions
      .filter((position) => !position.isDeleted)
      .map((position) => [position.id, position])
  );

  return {
    message: "Tao giao vien thanh cong.",
    data: mapTeacherForList(teacher, positionsMap),
  };
}

async function getTeacherDetail(id) {
  const [teacher, positions] = await Promise.all([
    storageService.getTeacherById(id),
    storageService.getTeacherPositions(),
  ]);

  if (!teacher) {
    return null;
  }

  const positionsMap = new Map(
    positions
      .filter((position) => !position.isDeleted)
      .map((position) => [position.id, position])
  );

  return mapTeacherForList(teacher, positionsMap);
}

module.exports = {
  listTeachers,
  createTeacher,
  getTeacherDetail,
};
