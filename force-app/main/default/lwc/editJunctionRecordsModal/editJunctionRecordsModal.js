import { LightningElement, api, wire } from 'lwc';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getJunctionObjectDetail from '@salesforce/apex/JunctionObjectHelper.getJunctionObjectDetail'
import getJunctionRecords from '@salesforce/apex/JunctionObjectHelper.getJunctionRecords'
import editJunctionRecords from '@salesforce/apex/JunctionObjectHelper.editJunctionRecords'

// custom labels
import junctionRecordsModal_Close from '@salesforce/label/c.JunctionObjectHelper_JunctionRecordsModal_Close';
import junctionRecordsModal_Save from '@salesforce/label/c.JunctionObjectHelper_JunctionRecordsModal_Save';
import junctionRecordsModal_Cancel from '@salesforce/label/c.JunctionObjectHelper_JunctionRecordsModal_Cancel';
import junctionRecordsModal_SaveRecordsError from '@salesforce/label/c.JunctionObjectHelper_JunctionRecordsModal_SaveRecordsError';
import junctionRecordsModal_LoadJunctionObjectDetailError from '@salesforce/label/c.JunctionObjectHelper_JunctionRecordsModal_LoadJunctionObjectDetailError';
import junctionRecordsModal_LoadJunctionObjectInfoError from '@salesforce/label/c.JunctionObjectHelper_JunctionRecordsModal_LoadJunctionObjectInfoError';
import junctionRecordsModal_SuccessfullyUpdated from '@salesforce/label/c.JunctionObjectHelper_JunctionRecordsModal_SuccessfullyUpdated';
import junctionRecordsModal_LoadJunctionRecordsError from '@salesforce/label/c.JunctionObjectHelper_JunctionRecordsModal_LoadJunctionRecordsError';
import junctionRecordsModal_NoAccessToUpdateRecordsError from '@salesforce/label/c.JunctionObjectHelper_JunctionRecordsModal_NoAccessToUpdateRecordsError';
import junctionRecordsModal_SomethingWentWrong from '@salesforce/label/c.JunctionObjectHelper_JunctionRecordsModal_SomethingWentWrong';
import junctionRecordsModal_EditRelatedMaster from '@salesforce/label/c.JunctionObjectHelper_JunctionRecordsModal_EditRelatedMaster';
import junctionRecordsModal_ConfigError from '@salesforce/label/c.JunctionObjectHelper_JunctionRecordsModal_ConfigError';


const OFFSET_STEP = 20

export default class EditJunctionRecordsModal extends LightningElement {
    @api recordId                           // id of the master 1 record
    @api junctionObjectName                 // api name of the junction object
    junctionObjectDetail                    // junction object detail
    junctionObjectInfos = {}
    junctionObjectFields = []
    junctionObjectFieldInfos = []
    junctionObjectRecords
    junctionObjectRecordsOffset = 0
    junctionObjectRecordsInfiniteLoading = true
    isJunctionObjectRecordsLoadingMore = false
    isJunctionObjectRecordsLoading = true
    junctionObjectDeletedRecords = []
    isSaveButtonDisabled = true
    _getJunctionObjectInfoParam
    configError
    loadingError
    editDatatableHasErrors = false
    editDatatableDisplayErrors = false

    // expose custom labels
    labels = {
        junctionRecordsModal_Close,
        junctionRecordsModal_Save,
        junctionRecordsModal_Cancel,
    }

    connectedCallback() {
        if (!this.recordId || !this.junctionObjectName) {
            this.configError = junctionRecordsModal_ConfigError
            this.isSaveButtonDisabled = true
        }
    }

    /**
     * public function to refresh the data 
     */
    @api
    refreshData() {
        if (this.junctionObjectDetail) {
            this.loadJunctionRecords()
        }
    }


    /**
     * get junction object detail
     */
    @wire(getJunctionObjectDetail, { master1Id: "$recordId", junctionObjectName: "$junctionObjectName" })
    getJunctionObjectDetail({ error, data }) {
        if (error) {
            this.configError = junctionRecordsModal_LoadJunctionObjectDetailError
            this.isSaveButtonDisabled = true
        } else if (data) {
            this.junctionObjectDetail = data
        }
        this._getJunctionObjectInfoParam = this.junctionObjectName
    }

    /**
     * get junction object info
     */
    @wire(getObjectInfo, { objectApiName: '$_getJunctionObjectInfoParam' })
    getJunctionObjectInfo({ error, data }) {
        if (error) {
            this.loadingError = junctionRecordsModal_LoadJunctionObjectInfoError
            this.junctionObjectRecords = []
        } else if (data) {
            if (data.fields) {
                let masterDetailFields = [this.junctionObjectDetail.master1.fieldName, this.junctionObjectDetail.master2.fieldName]
                let fields = Object.values(data.fields);
                let fieldInfos = []
                this.junctionObjectInfos.isCreateable = data.createable
                this.junctionObjectInfos.isUpdateable = data.updateable
                this.junctionObjectInfos.isDeletable = data.deletable
                this.junctionObjectFields = []
                fields.forEach(field => {
                    if (field.createable && !masterDetailFields.includes(field.apiName)) {
                        this.junctionObjectFields.push(field.apiName)
                        fieldInfos.push(field)
                    }
                })
                if (!this.junctionObjectFields.includes('Name')) {
                    this.junctionObjectFields.push('Name')
                }
                this.junctionObjectFieldInfos = fieldInfos
                this.loadJunctionRecords()
            }
        }
    }

    /**
     * load junction object records
     */
    loadJunctionRecords() {
        getJunctionRecords({
            junctionInfos: {
                master1Id: this.recordId,
                master1FieldName: this.junctionObjectDetail.master1.fieldName,
                junctionObjectName: this.junctionObjectName,
                master2RelationshipName: this.junctionObjectDetail.master2.relationshipName,
            },
            fields: this.junctionObjectFields,
            offset: 0
        })
            .then(data => {
                this.junctionObjectRecords = data.map(record => {
                    let recordOutput = Object.assign({}, record, { Master2NameField: record[this.junctionObjectDetail.master2.relationshipName].Name })
                    return recordOutput
                })
                this.isJunctionObjectRecordsLoading = false;
                this.isSaveButtonDisabled = (this.junctionObjectRecords.length === 0)
                this.junctionObjectRecordsInfiniteLoading = (this.junctionObjectRecords.length === OFFSET_STEP)
                this.junctionObjectRecordsOffset = 0
            })
            // eslint-disable-next-line no-unused-vars
            .catch(error => {
                this.loadingError = junctionRecordsModal_LoadJunctionRecordsError
                this.junctionObjectRecords = []
                this.isJunctionObjectRecordsLoading = false
                this.junctionObjectRecordsOffset = 0
            });
    }

    /**
     * load more junction object records
     */
    loadMoreJunctionRecords() {
        if (!this.isJunctionObjectRecordsLoadingMore) {
            this.isJunctionObjectRecordsLoadingMore = true
            this.junctionObjectRecordsOffset += OFFSET_STEP
            getJunctionRecords({
                junctionInfos: {
                    master1Id: this.recordId,
                    master1FieldName: this.junctionObjectDetail.master1.fieldName,
                    junctionObjectName: this.junctionObjectName,
                    master2RelationshipName: this.junctionObjectDetail.master2.relationshipName,
                },
                fields: this.junctionObjectFields,
                offset: this.junctionObjectRecordsOffset
            })
                .then(data => {
                    if (data.length) {
                        const junctionObjectRecords = this.junctionObjectRecords
                        const moreJunctionObjectRecords = data.map(record => {
                            let recordOutput = Object.assign({}, record, { Master2NameField: record[this.junctionObjectDetail.master2.relationshipName].Name })
                            return recordOutput
                        })
                        this.junctionObjectRecords = junctionObjectRecords.concat(moreJunctionObjectRecords)
                        this.isJunctionObjectRecordsLoadingMore = false
                        this.junctionObjectRecordsInfiniteLoading = (data.length === OFFSET_STEP)
                    } else {
                        this.junctionObjectRecordsInfiniteLoading = false
                    }
                })
                // eslint-disable-next-line no-unused-vars
                .catch(error => {
                    this.loadingError = junctionRecordsModal_LoadJunctionRecordsError
                    this.isJunctionObjectRecordsLoadingMore = false
                });
        }
    }

    /**
     * handle cell change on the datatable
     * @param {*} evt 
     */
    handleCellChange(evt) {
        this.junctionObjectRecords = evt.detail.records
        this.editDatatableHasErrors = evt.detail.hasErrors
        if (!this.editDatatableHasErrors) {
            this.editDatatableDisplayErrors = false
        }
    }

    /**
     * handle row selection 
     * @param {*} evt 
     */
    handleRowAction(evt) {
        let actionRecordId = evt.detail.row.Id
        this.junctionObjectRecords = this.junctionObjectRecords.filter(record => record.Id !== actionRecordId)
        this.junctionObjectDeletedRecords.push(actionRecordId)
    }

    /**
     * handle save button click 
     */
    handleSave() {
        if (!this.editDatatableHasErrors) {
            this.isSaveButtonDisabled = true
            let records = this.junctionObjectRecords.map(record => {
                let recordOutput = Object.assign({}, record)
                delete recordOutput.Master2NameField
                delete recordOutput[this.junctionObjectDetail.master2.fieldName]
                delete recordOutput[this.junctionObjectDetail.master2.relationshipName]
                return recordOutput
            })
            if (records && !this.junctionObjectInfos.isUpdateable) {
                this.showToast(junctionRecordsModal_NoAccessToUpdateRecordsError, '', 'error');
                this.resetContext();
                return;
            }
            editJunctionRecords({
                junctionObjectName: this.junctionObjectName,
                junctionObjectEditedRecords: records,
                junctionObjectDeletedRecords: this.junctionObjectDeletedRecords
            })
                // eslint-disable-next-line no-unused-vars
                .then(data => {
                    this.redirectToMaster1Record()
                    this.showToast('Success', junctionRecordsModal_SuccessfullyUpdated, 'success');
                    this.resetContext()
                })
                // eslint-disable-next-line no-unused-vars
                .catch(error => {
                    this.showToast(junctionRecordsModal_SaveRecordsError, '', 'error');
                    this.resetContext();
                });
        } else {
            this.editDatatableDisplayErrors = true
        }
    }

    /**
     * handle close button click 
     */
    handleClose() {
        this.closeModal()
    }

    /**
     * handle cancel button click 
     */
    handleCancel() {
        this.closeModal()
    }

    /**
     * close the modal and redirect back to the master record
     */
    closeModal() {
        this.redirectToMaster1Record()
        this.resetContext()
    }

    /**
     * reset the context of the LWC
     */
    resetContext() {
        // reset
        this.isSaveButtonDisabled = false
        this.junctionObjectDeletedRecords = []
        this.junctionObjectRecordsOffset = 0
        this._getJunctionObjectInfoParam = ''
        this.loadingError = ''
        this.configError = ''
        this.editDatatableHasErrors = false
        this.editDatatableDisplayErrors = false
    }

    /**
     * redirect to master 1 record
     */
    redirectToMaster1Record() {
        const redirectEvent = new CustomEvent("redirect", {
            detail: { recordId: this.recordId }
        });
        // fire redirect event
        this.dispatchEvent(redirectEvent);
    }

    /**
    * show toast
    */
    showToast(title, message, variant) {
        const evt = new ShowToastEvent({
            title,
            message,
            variant,
        });
        this.dispatchEvent(evt);
    }

    //=====================================================================
    //============================ getters ================================
    //=====================================================================

    /**
     * get modal infos (title, subtitle)
     */
    get modalInfo() {
        if (this.junctionObjectDetail) {
            return {
                title: junctionRecordsModal_EditRelatedMaster.replace('{RelatedMaster}', this.junctionObjectDetail.master2.labelPlural),
                subTitle: 'Junction Object Helper'
            }

        } else if (this.configError) {
            return {
                title: `Junction Object Helper`,
                subTitle: junctionRecordsModal_SomethingWentWrong
            }
        }
        return {}
    }


    /**
     * get disable delete action if junction object is not deletable
     */
    get disableDeleteAction() {
        if (this.junctionObjectInfos) {
            return !this.junctionObjectInfos.isDeletable
        }
        return false
    }

}