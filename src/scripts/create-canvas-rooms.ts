import { Client, Databases, ID } from 'node-appwrite';

// Usage: Ensure these env vars are set before running this script
// - NEXT_PUBLIC_APPWRITE_ENDPOINT
// - NEXT_PUBLIC_APPWRITE_PROJECT
// - DATABASE_INDEX_KEY (API key with databases.write scope)
// - NEXT_PUBLIC_APPWRITE_DATABASE_ID
// - NEXT_PUBLIC_APPWRITE_CANVAS_ROOMS_ID (desired collection id, e.g. "canvas_rooms")

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!)
  .setKey(process.env.DATABASE_INDEX_KEY!);

const databases = new Databases(client);

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const CANVAS_ROOMS_ID = process.env.NEXT_PUBLIC_APPWRITE_CANVAS_ROOMS_ID!;

async function ensureCanvasRoomsCollection() {
  if (!DATABASE_ID || !CANVAS_ROOMS_ID) {
    throw new Error('Missing DATABASE_ID or CANVAS_ROOMS_ID env vars');
  }

  try {
    // Create collection if it does not exist
    try {
      await databases.getCollection(DATABASE_ID, CANVAS_ROOMS_ID);
      console.log(`ℹ️  Collection already exists: ${CANVAS_ROOMS_ID}`);
    } catch (err: any) {
      if (err.code === 404) {
        console.log(`📦 Creating collection: ${CANVAS_ROOMS_ID}`);
        await databases.createCollection(
          DATABASE_ID,
          CANVAS_ROOMS_ID,
          CANVAS_ROOMS_ID,
          undefined,
          true,
        );
        console.log('✅ Collection created');
      } else {
        throw err;
      }
    }

    // Define attributes (idempotent: will skip when already present)
    const addString = async (key: string, size = 255, required = true) => {
      try {
        await databases.createStringAttribute(DATABASE_ID, CANVAS_ROOMS_ID, key, size, required);
        console.log(`✅ Added string attribute: ${key}`);
      } catch (e: any) {
        if (e.code === 409) console.log(`ℹ️  Attribute exists: ${key}`); else throw e;
      }
    };

    const addBoolean = async (key: string, required = false, defaultValue = false) => {
      try {
        await databases.createBooleanAttribute(DATABASE_ID, CANVAS_ROOMS_ID, key, required, defaultValue);
        console.log(`✅ Added boolean attribute: ${key}`);
      } catch (e: any) {
        if (e.code === 409) console.log(`ℹ️  Attribute exists: ${key}`); else throw e;
      }
    };

    const addStringArray = async (key: string) => {
      try {
        await databases.createStringAttribute(DATABASE_ID, CANVAS_ROOMS_ID, key, 255, false, undefined, true);
        console.log(`✅ Added string[] attribute: ${key}`);
      } catch (e: any) {
        if (e.code === 409) console.log(`ℹ️  Attribute exists: ${key}`); else throw e;
      }
    };

    await addString('name', 255, true);
    await addString('workspaceId', 64, true);
    await addString('createdBy', 64, true);
    await addString('lastModified', 64, true); // store ISO string
    await addStringArray('collaborators');
    await addBoolean('isPublic', false, false);

    console.log('🎯 Canvas Rooms collection is ready.');
  } catch (error) {
    console.error('❌ Failed to ensure Canvas Rooms collection:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  ensureCanvasRoomsCollection()
    .then(() => {
      console.log('✅ Done');
      process.exit(0);
    })
    .catch(() => process.exit(1));
}

export { ensureCanvasRoomsCollection };


