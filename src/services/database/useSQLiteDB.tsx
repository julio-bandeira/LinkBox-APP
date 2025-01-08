import { useEffect, useRef, useState } from "react";
import {
  SQLiteDBConnection,
  SQLiteConnection,
  CapacitorSQLite,
} from "@capacitor-community/sqlite";

const useSQLiteDB = () => {
  const db = useRef<SQLiteDBConnection>();
  const sqlite = useRef<SQLiteConnection>();
  const [initialized, setInitialized] = useState<boolean>(false);

  const initializeDB = async () => {
    return new Promise(async (resolve, reject) => {
      try {
        if(sqlite.current) {
          resolve(sqlite.current)
        }else {
          sqlite.current = new SQLiteConnection(CapacitorSQLite)
          const ret = await sqlite.current.checkConnectionsConsistency()
          const isConn = (await sqlite.current.isConnection("db_linkbox", false)).result
  
          if (ret.result && isConn) {
            db.current = await sqlite.current.retrieveConnection("db_linkbox", false)
          } else {
            db.current = await sqlite.current.createConnection(
              "db_linkbox",
              false,
              "no-encryption",
              1,
              false
            )
          }
          resolve(sqlite.current)
        }
      }catch(err) {
        reject(err)
      }
    })
  };
  
  useEffect(() => {
    if(initialized == false) {
      forcedInitialized()
    }
  }, [initialized]);

  const forcedInitialized = async () => {
    return new Promise(async (resolve, reject) => {
      initializeDB().then(async () => {
        if(initialized == false) {
          await initializeTables().then(() => {
            setInitialized(true)
            resolve('')
          });
        }
      }).catch((err: any) => {
        forcedInitialized()
      });
    })
  }

  const performSQLAction = async (
    action: (db: SQLiteDBConnection | undefined) => Promise<void>,
    cleanup?: () => Promise<void>
  ) => {
    try {
      await db.current?.open().then(async()=>{await action(db.current)});
      
    } catch (error) {
      //alert('(error as Error).message');
      //alert((error as Error).message);
    } finally {
      try {
        //retorna erro em acessos rapido ao banco de dados
        //(await db.current?.isDBOpen())?.result && (await db.current?.close());
        //não ter-lo talvez afete a performance ao longo do tempo preciso validar
        cleanup && (await cleanup());
      } catch {}
    }
  };

  const initializeTables = async () => {
    return new Promise(async (resolve, reject) => {
      performSQLAction(async (db: SQLiteDBConnection | undefined) => {
        const queryCreateTable = `
        CREATE TABLE IF NOT EXISTS linksCard (
          _id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT DEFAULT "",
          link TEXT DEFAULT ""
        );
      `;
        await db?.execute(queryCreateTable).then((respCT: any) => {
          resolve(respCT)
        })
        //const respCT = await db?.execute(queryCreateTable);
        //console.log(`res: ${JSON.stringify(respCT)}`);
      });
    })
  };

  return { forcedInitialized, initializeTables, performSQLAction, initialized };
};

export default useSQLiteDB;