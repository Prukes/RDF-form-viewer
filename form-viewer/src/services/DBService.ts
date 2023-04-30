import {openDB, IDBPDatabase, StoreNames} from 'idb';
import {
    FORMS_DATA_STORE,
    FORMS_DB,
    FORMS_FILES_STORE,
    FORMS_METADATA_STORE,
    FORMS_RECORDS_STORE, USER_CREDS
} from "../constants/DatabaseConstants";
import FormsDBSchema, {FormsDBRecord} from "../utils/FormsDBSchema";


// Define the options for opening the database
const dbName = FORMS_DB;
const dbVersion = 1;

let db: IDBPDatabase<FormsDBSchema> | null = null;

async function openDatabase(): Promise<IDBPDatabase<FormsDBSchema>> {
    if (db) {
        return db;
    }
    db = await openDB<FormsDBSchema>(dbName, dbVersion, {
        upgrade(db) {
            db.createObjectStore(FORMS_DATA_STORE);
            db.createObjectStore(FORMS_METADATA_STORE);
            db.createObjectStore(FORMS_RECORDS_STORE);
            db.createObjectStore(FORMS_FILES_STORE);
            db.createObjectStore(USER_CREDS,{keyPath:'uri'});
        },
    });
    return db;
}

// Define a function for getting a value from the database by key
export async function getFromDB(storeName: StoreNames<FormsDBSchema>, key: string | IDBValidKey): Promise<any> {
    const database = await openDatabase();
    const tx = database.transaction(storeName, 'readonly');
    const value = await tx.objectStore(storeName).get(key);
    await tx.done;
    return value;
}

// Define a function for setting a value in the database by key
export async function setInDB(storeName: StoreNames<FormsDBSchema>, key: string | IDBValidKey, value: any): Promise<void> {
    // console.log(storeName, 'opening');
    const database = await openDatabase();
    const tx = database.transaction(storeName, 'readwrite');
    await tx.objectStore(storeName).put(value, key);
    await tx.done;

}

// Define a function for getting all entries with keys from an object store -- doesn't return keys... big sad
export async function getAllFromDB(storeName: StoreNames<FormsDBSchema>): Promise<any[]> {
    const database = await openDatabase();
    const tx = database.transaction(storeName, 'readonly');
    const entries = await tx.objectStore(storeName).getAll();
    await tx.done;
    return entries;
}

export async function getAllFromDBWithKeys<T extends FormsDBSchema[keyof FormsDBSchema]>(
    storeName: StoreNames<FormsDBSchema>
    // ): Promise<{ key: IDBValidKey, value: T }[]> {
): Promise<FormsDBRecord<keyof FormsDBSchema>[]> {
    const entries: FormsDBRecord<keyof FormsDBSchema>[] = [];
    const database = await openDatabase();
    const tx = database.transaction(storeName, 'readonly');
    let cursor = await tx.objectStore(storeName).openCursor();

    while (cursor) {
        entries.push({key: cursor.primaryKey, value: cursor.value});
        cursor = await cursor.continue();
    }


    await tx.done;
    return entries;
}

export async function deleteFromDB(storeName: StoreNames<FormsDBSchema>, key: string | IDBValidKey): Promise<void> {
    const database = await openDatabase();
    const tx = database.transaction(storeName, 'readwrite');
    await tx.objectStore(storeName).delete(key);
    await tx.done;
}

// Define a function for closing the database connection
export async function closeDatabase(): Promise<void> {
    if (db) {
        await db.close();
        db = null;
    }
}