
/**
 * get the field value
 * @param {*} fieldList 
 * @param {*} name 
 */
const getFieldValue = (record, name) => {
    if (name.includes(".")) {
        let dotIndex = name.indexOf(".")
        let relationshipName = name.substring(0, dotIndex);
        let newName = name.substring(dotIndex + 1, name.length);
        let relatedRecord = record[relationshipName];
        if (relatedRecord) {
            return getFieldValue(relatedRecord, newName);
        }
    }
    let fieldValue = record[name]
    if (fieldValue != null) {
        return "" + fieldValue
    }
    return ""
}

/**
 * pase data from getListUi
 * @param {*} data 
 */
const parseListUiData = (data) => {
    let result = {}
    result.master2Fields = []
    result.master2Columns = []
    data.info.displayColumns.forEach(column => {
        result.master2Columns.push({
            fieldName: column.fieldApiName,
            label: column.label
        })
        result.master2Fields.push(column.fieldApiName)
    })

    return result
}

/**
 * parse records data
 * @param {*} columns 
 * @param {*} records 
 */
const parseRecordsData = (columns, records) => {
    let result = []
    records.forEach(record => {
        let recordOutput = { Id: record.Id }
        columns.forEach(column => {
            recordOutput[column.fieldName] = getFieldValue(record, column.fieldName)
        })
        result.push(recordOutput)
    })
    return result
}

/**
 * preparing records for save
 * @param {*} recordId 
 * @param {*} junctionObjectRecords 
 * @param {*} masterDetail1FieldName 
 * @param {*} masterDetail2FieldName 
 */
const prepareRecordsForSave = (recordId, junctionObjectRecords, masterDetail1FieldName, masterDetail2FieldName) => {
    let records = junctionObjectRecords.map(record => {
        let recordOutput = Object.assign({}, record)
        recordOutput[masterDetail1FieldName] = recordId
        recordOutput[masterDetail2FieldName] = record.Id
        delete recordOutput.Id
        delete recordOutput.Master2NameField
        return recordOutput
    })
    return records;
}

export {
    parseListUiData,
    prepareRecordsForSave,
    parseRecordsData,
};