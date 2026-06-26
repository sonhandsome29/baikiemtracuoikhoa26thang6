const fs = require("fs/promises");
const { MongoClient } = require("mongodb");
const {
  DATABASE_NAME,
  MONGODB_URI,
  POSITIONS_COLLECTION,
  POSITIONS_FILE,
  TEACHERS_COLLECTION,
  TEACHERS_FILE,
} = require("../config");
const { normalizeText } = require("../utils/text");

function safeJsonParse(content, fallback) {
  try {
    return JSON.parse(content);
  } catch {
    return fallback;
  }
}

async function readCollection(filePath) {
  const content = await fs.readFile(filePath, "utf8");
  return safeJsonParse(content, []);
}

async function writeCollection(filePath, data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
}

function isMongoUriConfigured(uri) {
  return (
    normalizeText(uri) &&
    !uri.includes("<db_username>") &&
    !uri.includes("<db_password>")
  );
}

function stripMongoId(document) {
  if (!document) {
    return null;
  }

  const { _id, ...rest } = document;
  return rest;
}

const storageService = {
  mode: "file",
  client: null,
  db: null,

  async init() {
    if (!isMongoUriConfigured(MONGODB_URI)) {
      this.mode = "file";
      return;
    }

    this.client = new MongoClient(MONGODB_URI);
    await this.client.connect();
    this.db = this.client.db(DATABASE_NAME);
    this.mode = "mongo";
    await this.seedMongoIfNeeded();
  },

  async seedMongoIfNeeded() {
    const teachersCollection = this.db.collection(TEACHERS_COLLECTION);
    const positionsCollection = this.db.collection(POSITIONS_COLLECTION);

    const [teachersCount, positionsCount] = await Promise.all([
      teachersCollection.countDocuments(),
      positionsCollection.countDocuments(),
    ]);

    if (teachersCount === 0) {
      const teachers = await readCollection(TEACHERS_FILE);
      if (teachers.length > 0) {
        await teachersCollection.insertMany(teachers);
      }
    }

    if (positionsCount === 0) {
      const positions = await readCollection(POSITIONS_FILE);
      if (positions.length > 0) {
        await positionsCollection.insertMany(positions);
      }
    }
  },

  async getTeachers() {
    if (this.mode === "mongo") {
      const teachers = await this.db.collection(TEACHERS_COLLECTION).find({}).toArray();
      return teachers.map(stripMongoId);
    }

    return readCollection(TEACHERS_FILE);
  },

  async getTeacherById(id) {
    const teachers = await this.getTeachers();
    return teachers.find((item) => !item.isDeleted && item.id === id) || null;
  },

  async createTeacher(teacher) {
    if (this.mode === "mongo") {
      await this.db.collection(TEACHERS_COLLECTION).insertOne(teacher);
      return;
    }

    const teachers = await readCollection(TEACHERS_FILE);
    teachers.unshift(teacher);
    await writeCollection(TEACHERS_FILE, teachers);
  },

  async getTeacherPositions() {
    if (this.mode === "mongo") {
      const positions = await this.db
        .collection(POSITIONS_COLLECTION)
        .find({})
        .toArray();
      return positions.map(stripMongoId);
    }

    return readCollection(POSITIONS_FILE);
  },

  async createTeacherPosition(position) {
    if (this.mode === "mongo") {
      await this.db.collection(POSITIONS_COLLECTION).insertOne(position);
      return;
    }

    const positions = await readCollection(POSITIONS_FILE);
    positions.unshift(position);
    await writeCollection(POSITIONS_FILE, positions);
  },

  async close() {
    if (this.client) {
      await this.client.close();
    }
  },
};

module.exports = storageService;
