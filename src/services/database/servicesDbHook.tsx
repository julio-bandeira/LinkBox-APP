//import useSQLiteDB from './useSQLiteDB';
import { SQLiteDBConnection } from '@capacitor-community/sqlite';
import { tableDb, allFieldsDb, filterDbType, allFieldsNameDb, anyTableDbType, joinDbType } from './databaseType'
import useSQLiteDB from './useSQLiteDB';

export default function useServicesDbHook() {
  // hook for sqlite db
  const { forcedInitialized, initializeTables, performSQLAction, initialized } = useSQLiteDB()

  const filterConstructor = (filters: filterDbType[], table: string = '', join: boolean = false) => {
    let sqlCommand: string = ''
    if(filters.length) {
      sqlCommand += ' WHERE'
      filters.forEach((filter: filterDbType, index) => {
        sqlCommand += ` ${join ? `${table}.` : ''}${filter.field} ${filter.type}`
        if(filter.type == 'IN') {
          sqlCommand +=' ('
          for(let i = 0; i < filter.value.length; i++) {
            sqlCommand += `${i > 0 ? ',' : ''}`
            if(typeof filter.value[i] == 'string') {
              sqlCommand += ` "${filter.value[i]}"`
            }else{
              if(typeof filter.value[i] == 'boolean') {
                sqlCommand += ` ${Number(filter.value[i])}`
              }else {
                sqlCommand += ` ${filter.value[i]}`
              }
            }
          }
          sqlCommand +=')'
        }else if(typeof filter.value == 'string') {
          if(filter.type != 'LIKE') {
            sqlCommand += ` "${filter.value}"`
          }else {
            sqlCommand += ` "%${filter.value}%"`
          }
        }else{
          if(typeof filter.value == 'boolean') {
            sqlCommand += ` ${Number(filter.value)}`
          }else {
            sqlCommand += ` ${filter.value}`
          }
        }
        if(index < filters.length - 1) {
          sqlCommand += ' AND'
        }
      })
    }
    return sqlCommand
  }

  return {
    initialized: initialized,
    forcedInitialized: forcedInitialized,
    getDb: (
      params: {
        table: tableDb,
        order?: {field: allFieldsNameDb, type: ('+'|'-')},
        fields?: allFieldsNameDb[],
        filter?: filterDbType[],
        page?: {limit: number, offset: number},
        join?: joinDbType[]
      }
    ) => {
      return new Promise(async (resolve, reject) => {
        try {
          let sqlCommand: string = 'SELECT'
          if(params.fields && params.fields.length) {
            sqlCommand += ''
            params.fields.forEach((field, index) => {
              sqlCommand += ` ${(params.join && params.join.length > 0) ? `${params.table}.` : ''}${field}`
              if(params.fields && index < params.fields.length - 1) {
                sqlCommand += ','
              }
            })
          }else{
            if(params.join && params.join?.length > 0) {
              sqlCommand += ` ${params.table}.*`
            }else{
              sqlCommand += ' *'
            }
          }
          if(params.join && params.join?.length > 0) {
            params.join.forEach((joinRef, indexJoin) => {
              sqlCommand += ','
              joinRef.fields.forEach((joinField, indexField) => {
                sqlCommand += ` ${joinRef.table}.${joinField.field}`
                sqlCommand += `${joinField.as && joinField.as != '' ? ` AS ${joinField.as}` : ''}`
                if(indexField < joinRef.fields.length - 1) {
                  sqlCommand += ','
                }
              })
            })
          }
          sqlCommand += ` FROM ${params.table}`
          if(params.join && params.join?.length > 0) {
            params.join.forEach((joinRef, index) => {
              sqlCommand += ` LEFT JOIN ${joinRef.table} ON ${params.table}.${joinRef.reference.main} = ${joinRef.table}.${joinRef.reference.join}`
            })
          }
          if(params.filter) {
            sqlCommand += filterConstructor(params.filter, params.table, (params.join && params.join.length > 0))
          }
          if(params.order) {
            sqlCommand += ` ORDER BY ${params.table}.${params.order.field} ${params.order.type == '+' ? 'ASC' : 'DESC'}`
          }
          if(params.page && params.page != undefined && params.page.limit > 0) {
            sqlCommand += ` LIMIT ${params.page.limit} OFFSET ${params.page.offset}`
          }
          sqlCommand += ';'
    
          //alert(sqlCommand)
          //resolve(sqlCommand)

          // query db
          performSQLAction(async (db: SQLiteDBConnection | undefined) => {
            const respSelect = await db?.query(sqlCommand);
            resolve(respSelect?.values);
          })
        } catch(error) {
          reject(error);
        }
      })
    },
    countDb: (
      params: {
        table: tableDb,
        filter: filterDbType[]
      }
    ) => {
      return new Promise((resolve, reject) => {
        try {
          let sqlCommand: string = ''
          sqlCommand += `SELECT COUNT(*) FROM ${params.table}`
          sqlCommand += filterConstructor(params.filter)
          sqlCommand += `;`

          //alert(sqlCommand)
          //resolve(sqlCommand)

          // query db
          performSQLAction(async (db: SQLiteDBConnection | undefined) => {
            const respSelect = await db?.query(sqlCommand);
            resolve(JSON.stringify(respSelect?.values));
          })
        }catch(error) {
          reject(error)
        }
      })
    },
    insertDb: (
      params: {
        table: tableDb,
        values: anyTableDbType[]
      }
    ) => {
      return new Promise((resolve, reject) => {
        try {
          if(params.values.length > 0) {
            let sqlCommand: string = ''
            sqlCommand += `INSERT OR REPLACE INTO ${params.table} ( `
            let getColumn = Object.keys(params.values[0])
            getColumn.forEach((column, index) => {
              sqlCommand += `${column}${index == getColumn.length - 1 ? ' )' : ', '}`
            })
            sqlCommand += ' VALUES'
            params.values.forEach((value: any, index) => {
              sqlCommand +=` (`
              getColumn.forEach((column, columnIndex) => {
                if(value[column] == undefined || value[column] == null) {
                  sqlCommand += ` NULL`
                }else if(JSON.stringify(value[column]) == '[]' || Array.isArray(value[column]) == true) {
                  sqlCommand += ` "${JSON.stringify(value[column]).replaceAll('"','""').replaceAll("'","''")}"`
                }else if(typeof value[column] == 'string') {
                  sqlCommand += ` "${value[column].replaceAll('"','""').replaceAll("'","''")}"`
                }else if(typeof value[column] == 'object') {
                  sqlCommand += ` "${(value[column])?._id}"`
                }else {
                  if(typeof value[column] == 'boolean') {
                    sqlCommand += ` ${Number(value[column])}`
                  }else {
                    sqlCommand += ` ${value[column]}`
                  }
                }
                sqlCommand += `${columnIndex == getColumn.length - 1 ? '' : ', '}`//inserir valores de acordo com campo
              })
              sqlCommand +=`)${index == params.values.length - 1 ? ';' : ', '}`
            })
            
            
            //alert(sqlCommand)
            //resolve(sqlCommand)
  
            // query db
            performSQLAction(async (db: SQLiteDBConnection | undefined) => {
              //const respSelect = await db?.query(sqlCommand);
              await db?.query(sqlCommand).then((respSelect) => {
                resolve(JSON.stringify(respSelect?.values));
              }).catch((err) => {
                reject(err)
              })
            })
          }else {
            resolve('nada a ser importado')
          }
        } catch(error) {
          reject(error)
        }
      })
    },
    updateDb: (
      params: {
        table: tableDb,
        value: anyTableDbType,
        filter: filterDbType[]
      }
    ) => {
      return new Promise((resolve, reject) => {
        try {
          let sqlCommand: string = ''
          sqlCommand += `UPDATE ${params.table} SET `
          let fields = Object.keys(params.value)
          fields.forEach((field: string, index) => {
            if(typeof params.value[field] == 'string') {
              sqlCommand += `${field} = "${(params.value[field] as string).replaceAll('"','""').replaceAll("'","''")}"`
            }else{
              if(typeof params.value[field] == 'boolean') {
                sqlCommand += `${field} = ${Number(params.value[field])}`
              }else {
                sqlCommand += `${field} = ${params.value[field]}`
              }
            }
            if(index < fields.length - 1) {
              sqlCommand += `, `
            }
          })
          sqlCommand += filterConstructor(params.filter)

          //chamarDb
          //alert(sqlCommand)
          //resolve(sqlCommand)

          // query db
          performSQLAction(async (db: SQLiteDBConnection | undefined) => {
            const respSelect = await db?.query(sqlCommand);
            resolve(JSON.stringify(respSelect?.values));
          })
        } catch(error) {
          reject(error)
        }
      })
    },
    deleteDb: (
      params: {
        table: tableDb,
        filter: filterDbType[]
      }
    ) => {
      return new Promise((resolve, reject) => {
        try {
          if(params.filter.length) {
            let sqlCommand: string = ''
            sqlCommand += `DELETE FROM ${params.table}`
            sqlCommand += filterConstructor(params.filter)
            
            //chamarDb
            //alert(sqlCommand)
            //resolve(sqlCommand)
            
            // query db
            performSQLAction(async (db: SQLiteDBConnection | undefined) => {
              const respSelect = await db?.query(sqlCommand);
              resolve(JSON.stringify(respSelect?.values));
            })
          }else {
            reject('To delete you need at least one filter')
          }
        } catch(error) {
          reject(error)
        }
      })
    },
    getByScanDb: (
      params: {
        table: tableDb,
        fields?: allFieldsNameDb[],
        filter: filterDbType[],
        perPage: number,
        callback: (counter: number, data: any) => void
      }
    ) => {
      return new Promise(async (resolve, reject) => {
        let totalInSearch = 0
        await performSQLAction(async (db: SQLiteDBConnection | undefined) => {
          let sqlCount: string = ''
          sqlCount += `SELECT COUNT(*) FROM ${params.table}`
          sqlCount += filterConstructor(params.filter)
          sqlCount += `;`
          const respCount = await db?.query(sqlCount);
          if(respCount?.values) {
            totalInSearch = respCount?.values[0]['COUNT(*)']
          }
        })
        
        try {
          let offset = 0
          while (true) {
            let sqlCommand: string = 'SELECT'
            if(params.fields && params.fields.length) {
              sqlCommand += ''
              params.fields.forEach((field, index) => {
                sqlCommand += ` ${field}`
                if(params.fields && index < params.fields.length - 1) {
                  sqlCommand += ','
                }
              })
            }else{
              sqlCommand += ' *'
            }
            sqlCommand += ` FROM ${params.table}`
            sqlCommand += filterConstructor(params.filter)
            sqlCommand += ` LIMIT ${params.perPage} OFFSET ${offset}`
            sqlCommand += ';'

            //alert(sqlCommand)
            //resolve(sqlCommand)
            let toBreak = false
            // query db
            await performSQLAction(async (db: SQLiteDBConnection | undefined) => {
              const respSelect = await db?.query(sqlCommand);
              if(respSelect?.values == undefined || respSelect?.values.length <= 0) {
                resolve(respSelect?.values);
                toBreak = true
              }else{
                offset += params.perPage
                let limitOffeset = offset < totalInSearch ? offset : totalInSearch
                await params.callback((limitOffeset/totalInSearch), respSelect?.values)
              }
            })
            
            if(toBreak) {
              break
            }
          }
        } catch(error) {
          reject(error);
        }
      })
    },
    customSqlDb: (
      params: {
        sqlCommand: string
      }
    ) => {
      return new Promise((resolve, reject) => {
        try {
          // query db
          performSQLAction(async (db: SQLiteDBConnection | undefined) => {
            const respSelect = await db?.query(params.sqlCommand);
            resolve(respSelect?.values);
          })
        }catch(error) {
          reject(error)
        }
      })
    },
    clearAllTables: () => {
      return new Promise(async (resolve, reject) => {
        try {
          const sqlCommand = `
            PRAGMA foreign_keys=off;
            DROP TABLE IF EXISTS last_access;
            DROP TABLE IF EXISTS conta;
            DROP TABLE IF EXISTS conta_config;
            DROP TABLE IF EXISTS usuario;
            DROP TABLE IF EXISTS categoria;
            DROP TABLE IF EXISTS marca;
            DROP TABLE IF EXISTS modelo;
            DROP TABLE IF EXISTS select_box;
            DROP TABLE IF EXISTS nivel_loc_1;
            DROP TABLE IF EXISTS nivel_loc_2;
            DROP TABLE IF EXISTS nivel_loc_3;
            DROP TABLE IF EXISTS nivel_loc_4;
            DROP TABLE IF EXISTS parceiro;
            DROP TABLE IF EXISTS item;
            DROP TABLE IF EXISTS registro;
            DROP TABLE IF EXISTS registro_pedido;
            DROP TABLE IF EXISTS registro_tag;
            PRAGMA foreign_keys=on;
          `;
  
          performSQLAction(async (db: SQLiteDBConnection | undefined) => {
            const respSelect = await db?.query(sqlCommand);
            await db?.delete()
            initializeTables().then(
              () => {
                resolve(JSON.stringify(respSelect?.values));
              }
            )
          })
        }catch(err) {
          reject(err)
        }
      })
    }
  }
}