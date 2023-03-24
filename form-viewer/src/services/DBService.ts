import {openDB, DBSchema, IDBPDatabase, StoreNames} from 'idb';
import {FORMS_DATA_STORE, FORMS_DB, FORMS_METADATA_STORE} from "../constants/DatabaseConstants";
import FormsDBSchema from "../utils/FormsDBSchema";


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
        },
    });
    return db;
}

// Define a function for getting a value from the database by key
export async function getFromDB(storeName: StoreNames<FormsDBSchema>, key: string | IDBKeyRange): Promise<any> {
    const database = await openDatabase();
    const tx = database.transaction(storeName, 'readonly');
    const value = await tx.objectStore(storeName).get(key);
    await tx.done;
    return value;
}

// Define a function for setting a value in the database by key
export async function setInDB(storeName: StoreNames<FormsDBSchema>, key: string | IDBKeyRange, value: any): Promise<void> {
    console.log(storeName, 'opening');
    const database = await openDatabase();
    const tx = database.transaction(storeName, 'readwrite');
    await tx.objectStore(storeName).put(value, key);
    await tx.done;

}

// Define a function for getting all entries with keys from an object store
export async function getAllFromDB(storeName: StoreNames<FormsDBSchema>): Promise<any[]> {
    const database = await openDatabase();
    const tx = database.transaction(storeName, 'readonly');
    const entries = await tx.objectStore(storeName).getAll();
    await tx.done;
    return entries;
}

// Define a function for closing the database connection
export async function closeDatabase(): Promise<void> {
    if (db) {
        await db.close();
        db = null;
    }
}