import { LightningElement, api, wire } from 'lwc';
import { getListUi, MRU } from 'lightning/uiListApi';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getJunctionObjectDetail from '@salesforce/apex/JunctionObjectHelper.getJunctionObjectDetail';
import getMaster2Records from '@salesforce/apex/JunctionObjectHelper.getMaster2Records';
import getFilteredMaster2Records from '@salesforce/apex/JunctionObjectHelper.getFilteredMaster2Records';
import createJunctionRecords from '@salesforce/apex/JunctionObjectHelper.createJunctionRecords';
import * as addJunctionRecordsModalUtils from './addJunctionRecordsModalUtils';

// custom labels
import junctionRecordsModal_Close from '@salesforce/label/c.JunctionObjectHelper_JunctionRecordsModal_Close';
import junctionRecordsModal_Next from '@salesforce/label/c.JunctionObjectHelper_JunctionRecordsModal_Next';
import junctionRecordsModal_Back from '@salesforce/label/c.JunctionObjectHelper_JunctionRecordsModal_Back';
import junctionRecordsModal_Save from '@salesforce/label/c.JunctionObjectHelper_JunctionRecordsModal_Save';
import junctionRecordsModal_Cancel from '@salesforce/label/c.JunctionObjectHelper_JunctionRecordsModal_Cancel';
import junctionRecordsModal_SaveRecordsError from '@salesforce/label/c.JunctionObjectHelper_JunctionRecordsModal_SaveRecordsError';
import junctionRecordsModal_LoadJunctionObjectDetailError from '@salesforce/label/c.JunctionObjectHelper_JunctionRecordsModal_LoadJunctionObjectDetailError';
import junctionRecordsModal_LoadJunctionObjectInfoError from '@salesforce/label/c.JunctionObjectHelper_JunctionRecordsModal_LoadJunctionObjectInfoError';
import junctionRecordsModal_SearchMustHave2Chars from '@salesforce/label/c.JunctionObjectHelper_JunctionRecordsModal_SearchMustHave2Chars';
import junctionRecordsModal_ViewAll from '@salesforce/label/c.JunctionObjectHelper_JunctionRecordsModal_ViewAll';
import junctionRecordsModal_SuccessfullyCreated from '@salesforce/label/c.JunctionObjectHelper_JunctionRecordsModal_SuccessfullyCreated';
import junctionRecordsModal_SearchRecordsError from '@salesforce/label/c.JunctionObjectHelper_JunctionRecordsModal_SearchRecordsError';
import junctionRecordsModal_QueryRecordsError from '@salesforce/label/c.JunctionObjectHelper_JunctionRecordsModal_QueryRecordsError';
import junctionRecordsModal_LoadRecordsError from '@salesforce/label/c.JunctionObjectHelper_JunctionRecordsModal_LoadRecordsError';
import junctionRecordsModal_SomethingWentWrong from '@salesforce/label/c.JunctionObjectHelper_JunctionRecordsModal_SomethingWentWrong';
import junctionRecordsModal_AddRelatedMaster from '@salesforce/label/c.JunctionObjectHelper_JunctionRecordsModal_AddRelatedMaster';
import junctionRecordsModal_EditSelectedRelatedMaster from '@salesforce/label/c.JunctionObjectHelper_JunctionRecordsModal_EditSelectedRelatedMaster';
import junctionRecordsModal_ConfigError from '@salesforce/label/c.JunctionObjectHelper_JunctionRecordsModal_ConfigError';


const OFFSET_STEP = 20;

export default class CreateMultipleJunctionObjectsModal extends LightningElement {
    @api recordId                           // id of the master 1 record
    @api junctionObjectName                 // api name of the junction object
    junctionObjectDetail                    // junction object detail
    step = 1                                // step : 1 = first screen , 2 = second screen
    master2Columns
    master2Fields = []
    master2Records
    master2RecordsOffset = 0
    master2RecordsInfiniteLoading = true
    isMaster2RecordsLoadingMore = false
    master2SelectedIds = []
    isMaster2RecordsLoading = true
    searchTerm
    searchValue
    junctionObjectFields = []
    junctionObjectFieldInfos = []
    junctionObjectSelectedRecords
    isSaveButtonDisabled = false
    _getJunctionObjectInfoParam
    _loadMaster2ListViewParam
    _loadMaster2ListViewResult
    configError
    loadingError
    editDatatableHasErrors = false
    editDatatableDisplayErrors = false

    // expose custom labels
    labels = {
        junctionRecordsModal_Close,
        junctionRecordsModal_Next,
        junctionRecordsModal_Back,
        junctionRecordsModal_Save,
        junctionRecordsModal_Cancel,
        junctionRecordsModal_SearchMustHave2Chars,
        junctionRecordsModal_ViewAll,
    }

    connectedCallback() {
        if (!this.recordId || !this.junctionObjectName) {
            this.configError = junctionRecordsModal_ConfigError
        }
    }

    /**
     * public function to refresh the data 
     */
    @api
    refreshData() {
        if (this.junctionObjectDetail) {
            this.loadMaster2Records()
        }
    }

    /**
     * get junction object detail
     */
    @wire(getJunctionObjectDetail, { master1Id: "$recordId", junctionObjectName: "$junctionObjectName" })
    getJunctionObjectDetail({ error, data }) {
        if (error) {
            this.configError = junctionRecordsModal_LoadJunctionObjectDetailError
        } else if (data) {
            this.junctionObjectDetail = data
            this._loadMaster2ListViewParam = this.junctionObjectDetail.master2.name
        }
    }

    /**
     * get junction object info
     */
    @wire(getObjectInfo, { objectApiName: '$_getJunctionObjectInfoParam' })
    getJunctionObjectInfo({ error, data }) {
        if (error) {
            this.loadingError = junctionRecordsModal_LoadJunctionObjectInfoError
            this.isSaveButtonDisabled = true
        } else if (data) {
            if (data.fields) {
                let masterDetailFields = [this.junctionObjectDetail.master1.fieldName, this.junctionObjectDetail.master2.fieldName]
                let fields = Object.values(data.fields);
                let fieldInfos = []
                fields.forEach(field => {
                    if (field.createable && !masterDetailFields.includes(field.apiName)) {
                        this.junctionObjectFields.push(field.apiName)
                        fieldInfos.push(field)
                    }
                })
                this.junctionObjectFieldInfos = fieldInfos
            }
        }
    }

    /**
     * load the most recently viewed list view for the master 2 object
     */
    @wire(getListUi, { objectApiName: '$_loadMaster2ListViewParam', listViewApiName: MRU })
    loadMaster2ListView(result) {
        this._loadMaster2ListViewResult = result;
        let { error, data } = result;
        if (error) {
            this.isMaster2RecordsLoading = false
            this.master2Columns = []
            this.loadingError = junctionRecordsModal_LoadRecordsError
        } else if (data) {
            let parsedData = addJunctionRecordsModalUtils.parseListUiData(data);
            this.master2Columns = parsedData.master2Columns
            this.master2Fields = parsedData.master2Fields
            this.loadMaster2Records()
        }
    }

    /**
     * load master 2 records
     */
    loadMaster2Records() {
        getMaster2Records({
            master2Name: this.junctionObjectDetail.master2.name,
            master2NameField: this.junctionObjectDetail.master2.nameField,
            fields: this.master2Fields,
            offset: 0
        })
            .then(data => {
                this.master2Records = addJunctionRecordsModalUtils.parseRecordsData(this.master2Columns, data)
                this.isMaster2RecordsLoading = false
                this.master2RecordsInfiniteLoading = (this.master2Records.length === OFFSET_STEP)
                this.master2RecordsOffset = 0
            })
            // eslint-disable-next-line no-unused-vars
            .catch(error => {
                this.showToast(junctionRecordsModal_QueryRecordsError, '', 'error');
                this.isMaster2RecordsLoading = false
                this.master2RecordsInfiniteLoading = false
                this.master2RecordsOffset = 0
            });
    }

    /**
     * load more master 2 records
     */
    loadMoreMaster2Records() {
        if (!this.isMaster2RecordsLoadingMore) {
            this.isMaster2RecordsLoadingMore = true
            this.master2RecordsOffset += OFFSET_STEP
            getMaster2Records({
                master2Name: this.junctionObjectDetail.master2.name,
                master2NameField: this.junctionObjectDetail.master2.nameField,
                fields: this.master2Fields,
                offset: this.master2RecordsOffset
            })
                .then(data => {
                    if (data.length) {
                        const master2Records = this.master2Records;
                        const moreMaster2Records = addJunctionRecordsModalUtils.parseRecordsData(this.master2Columns, data)
                        this.master2Records = master2Records.concat(moreMaster2Records);
                        this.isMaster2RecordsLoadingMore = false
                        this.master2RecordsInfiniteLoading = (data.length === OFFSET_STEP)
                    } else {
                        this.master2RecordsInfiniteLoading = false
                    }
                })
                // eslint-disable-next-line no-unused-vars
                .catch(error => {
                    this.showToast(junctionRecordsModal_QueryRecordsError, '', 'error');
                    this.isMaster2RecordsLoadingMore = false
                });
        }
    }

    /**
     * load filtered master 2 records
     */
    loadFilteredMaster2Records() {
        this.master2RecordsInfiniteLoading = false
        getFilteredMaster2Records({
            searchTerm: this.searchTerm,
            master2Name: this.junctionObjectDetail.master2.name,
            master2NameField: this.junctionObjectDetail.master2.nameField,
            fields: this.master2Fields
        })
            .then(data => {
                this.master2Records = addJunctionRecordsModalUtils.parseRecordsData(this.master2Columns, data)
                this.isMaster2RecordsLoading = false
            })
            // eslint-disable-next-line no-unused-vars
            .catch(error => {
                this.showToast(junctionRecordsModal_SearchRecordsError, '', 'error');
                this.isMaster2RecordsLoading = false
            });
    }

    /**
     * hande search on the master 2 records
     * @param {*} evt 
     */
    handleSearch(evt) {
        const isEnterKey = evt.keyCode === 13;
        if (isEnterKey) { // is enter key 
            this.searchTerm = evt.target.value;
            if (this.searchTerm.length > 1) {
                this.isMaster2RecordsLoading = true
                this.loadFilteredMaster2Records()
            }
        }
    }

    /**
     * handle view all click
     */
    handleViewAll() {
        this.searchTerm = '';
        this.searchValue = '';
        this.isMaster2RecordsLoading = true
        this.loadMaster2Records()
    }

    /**
     * handle row selection 
     * @param {*} evt 
     */
    handleRowSelection(evt) {
        let selectedRows = evt.detail.selectedRows
        this.master2SelectedIds = selectedRows.map(record => {
            return record.Id
        })
        this.junctionObjectSelectedRecords = selectedRows.map(record => {
            return { Id: record.Id, Master2NameField: record.Name }
        })
    }

    /**
     * handle cell change on the datatable
     * @param {*} evt 
     */
    handleCellChange(evt) {
        this.junctionObjectSelectedRecords = evt.detail.records
        this.editDatatableHasErrors = evt.detail.hasErrors
        if (!this.editDatatableHasErrors) {
            this.editDatatableDisplayErrors = false
        }
    }

    /**
     * handle row action on the datatable
     * @param {*} evt 
     */
    handleRowAction(evt) {
        let actionRecordId = evt.detail.row.Id
        this.master2SelectedIds = this.master2SelectedIds.filter(id => id !== actionRecordId)
        this.junctionObjectSelectedRecords = this.junctionObjectSelectedRecords.filter(record => record.Id !== actionRecordId)
    }

    /**
     * handle next button click
     */
    handleNext() {
        this.step = 2
        this._getJunctionObjectInfoParam = this.junctionObjectName
    }

    /**
     * handle save button click 
     */
    handleSave() {
        if (!this.editDatatableHasErrors) {
            this.isSaveButtonDisabled = true
            let records = addJunctionRecordsModalUtils.prepareRecordsForSave(
                this.recordId,
                this.junctionObjectSelectedRecords,
                this.junctionObjectDetail.master1.fieldName,
                this.junctionObjectDetail.master2.fieldName
            );
            createJunctionRecords({
                junctionObjectName: this.junctionObjectName,
                junctionObjectCreatedRecords: records
            })
                // eslint-disable-next-line no-unused-vars
                .then(data => {
                    this.redirectToMaster1Record()
                    this.showToast('Success', junctionRecordsModal_SuccessfullyCreated, 'success');
                    this.resetContext()
                })
                // eslint-disable-next-line no-unused-vars
                .catch(error => {
                    this.showToast(junctionRecordsModal_SaveRecordsError, '', 'error');
                    this.isSaveButtonDisabled = false
                });
        } else {
            this.editDatatableDisplayErrors = true
        }
    }
    /**
     * handle back button click
     */
    handleBack() {
        this.step = 1
        this.editDatatableDisplayErrors = false
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
        this.step = 1
        this.master2SelectedIds = []
        this.junctionObjectSelectedRecords = []
        this.master2RecordsOffset = 0
        this.searchTerm = ''
        this.searchValue = ''
        this.isSaveButtonDisabled = false
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
     * get modal info (title, subtitle)
     */
    get modalInfo() {
        if (this.junctionObjectDetail) {
            if (this.isStep1) {
                return {
                    title: junctionRecordsModal_AddRelatedMaster.replace('{RelatedMaster}', this.junctionObjectDetail.master2.labelPlural),
                    subTitle: 'Junction Object Helper'
                }
            }
            return {
                title: junctionRecordsModal_EditSelectedRelatedMaster.replace('{RelatedMaster}', this.junctionObjectDetail.master2.labelPlural),
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
     * true if the next button should be disabled
     */
    get isNextButtonDisabled() {
        return !this.junctionObjectSelectedRecords || this.junctionObjectSelectedRecords.length === 0
    }

    /**
     * true is search term is valid
     */
    get isSearchTermValid() {
        if (this.searchTerm) {
            return this.searchTerm.length > 1;
        } return true
    }

    /**
     * true if search term is empty
     */
    get isSearchTermEmpty() {
        if (this.searchTerm) {
            return this.searchTerm.length < 2;
        } return true
    }

    /**
     * true if is step 1
     */
    get isStep1() {
        return this.step === 1;
    }

    /**
     * true if is step 2
     */
    get isStep2() {
        return this.step === 2;
    }

}