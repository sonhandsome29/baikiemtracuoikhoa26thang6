const { normalizeComparable, normalizeText } = require("./text");

const EDUCATION_RANK = {
  trungcap: 1,
  caodang: 2,
  cunhan: 3,
  kysu: 3,
  thacsi: 4,
  tiensi: 5,
};

function normalizeEducations(rawEducations) {
  if (!Array.isArray(rawEducations)) {
    return [];
  }

  return rawEducations
    .map((education) => ({
      level: normalizeText(education.level),
      school: normalizeText(education.school),
      major: normalizeText(education.major),
      status: normalizeText(education.status),
      graduatedAt: normalizeText(education.graduatedAt),
    }))
    .filter(
      (education) =>
        education.level || education.school || education.major || education.status
    );
}

function getHighestEducation(educations) {
  if (!Array.isArray(educations) || educations.length === 0) {
    return null;
  }

  const normalizedEducations = educations.map((education) => ({
    ...education,
    rank: EDUCATION_RANK[normalizeComparable(education.level)] || 0,
  }));

  normalizedEducations.sort((left, right) => right.rank - left.rank);
  return normalizedEducations[0];
}

module.exports = {
  normalizeEducations,
  getHighestEducation,
};
