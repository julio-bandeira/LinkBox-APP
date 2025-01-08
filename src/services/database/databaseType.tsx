export type tableDb = (
    'linksCard'
)

export type allFieldsDb = {
    _id?: any,
    title?: any,
    link?: any
}

export type allFieldsNameDb = (
    '_id' |
    'title' |
    'link'
)

export type linksCardDbType = {
    _id?: number,
    title?: string,
    link?: string,
    [chave: string]: null | undefined | string | number
}

export type anyTableDbType = (
    linksCardDbType
)

type filterType = (
    '=' |
    '!=' |
    '<' |
    '<=' |
    '>' |
    '>=' |
    'LIKE' |
    'IN'
)

export type filterDbType = {
    field: allFieldsNameDb,
    type: filterType,
    value: any
}

export type joinDbType = {
    table: tableDb,
    reference: {main: allFieldsNameDb, join: allFieldsNameDb}
    fields: {field: allFieldsNameDb, as?: string}[]
}