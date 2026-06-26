const { randomUUID } = require("crypto");
const storageService = require("./storageService");
const { normalizeText, sanitizeBoolean } = require("../utils/text");

function validatePositionPayload(payload, existingPositions) {
  const code = normalizeText(payload.code).toUpperCase();
  const name = normalizeText(payload.name);
  const des = normalizeText(payload.des);

  if (!code || !name || !des) {
    return "Ma, ten va mo ta cua vi tri cong tac la bat buoc.";
  }

  const duplicatedCode = existingPositions.some(
    (position) =>
      !position.isDeleted && position.code.toUpperCase() === code.toUpperCase()
  );

  if (duplicatedCode) {
    return "Code cua vi tri cong tac phai la duy nhat.";
  }

  return null;
}

async function listTeacherPositions() {
  const positions = await storageService.getTeacherPositions();
  return positions.filter((position) => !position.isDeleted);
}

async function createTeacherPosition(payload) {
  const positions = await storageService.getTeacherPositions();
  const validationError = validatePositionPayload(payload, positions);

  if (validationError) {
    return { error: validationError };
  }

  const position = {
    id: randomUUID(),
    code: normalizeText(payload.code).toUpperCase(),
    name: normalizeText(payload.name),
    des: normalizeText(payload.des),
    isActive: sanitizeBoolean(payload.isActive, true),
    isDeleted: false,
  };

  await storageService.createTeacherPosition(position);

  return {
    message: "Tao vi tri cong tac thanh cong.",
    data: position,
  };
}

module.exports = {
  listTeacherPositions,
  createTeacherPosition,
};
