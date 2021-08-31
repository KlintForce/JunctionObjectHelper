import { LightningElement, api } from "lwc";

/**
 * list junction records with a datatable
 */
export default class ListJunctionObjects extends LightningElement {
  @api junctionObjectName;
  @api master2NameFieldLabel;
  @api junctionObjectFieldInfos;
  @api junctionObjectRecords;
  @api enableInfiniteLoading
  @api disableDeleteAction = false
  @api displayErrors = false
  isLoading = true;
  hasRendered;
  _records = []

  /**
   * rendered callback
   */
  renderedCallback() {
    if (this.hasRendered) {
      return;
    }
    this.hasRendered = true;

    // eslint-disable-next-line @lwc/lwc/no-async-operation
    setTimeout(() => {
      this.isLoading = false;
    }, 250);

    // fix datatable styling
    const style = document.createElement("style");
    style.title = "fix datatable styling";
    style.innerText = `
        c-edit-form-datatable .slds-scrollable_y {
          height: 100%;
        }
        c-edit-form-datatable .slds-th__action {
          justify-content: center;
        }
        `;
    this.template.querySelector("c-edit-form-datatable").appendChild(style);
  }

  /**
   * handle loading more records
   */
  handleLoadMore() {
    const loadmore = new CustomEvent("loadmore");
    // fire a load more event
    this.dispatchEvent(loadmore);
  }

  /**
   * handle input field change in a cell
   * @param {*} evt : event
   */
  handleInputFieldChange(evt) {
    let recordEdit = evt.detail.values;
    let records = this.junctionObjectRecords.map(record => {
      if (record.Id === recordEdit.Id) {
        return Object.assign({}, record, recordEdit);
      }
      return record;
    });
    this._records = records
    const cellchange = new CustomEvent("cellchange", {
      detail: {
        hasErrors: Object.keys(this.errors.rows).length !== 0,
        records: records
      }
    });
    // fire a cell change event
    this.dispatchEvent(cellchange);
  }

  /**
   * handle row action
   * @param {*} evt : event
   */
  handleRowAction(evt) {
    const rowaction = new CustomEvent("rowaction", {
      detail: evt.detail
    });
    // fire a row action event
    this.dispatchEvent(rowaction);
  }

  //=====================================================================
  //============================ getters ================================
  //=====================================================================
  /**
   * get columns
   */
  get columns() {
    if (this.junctionObjectFieldInfos) {
      let columns = [];
      columns.push({
        fieldName: "Master2NameField",
        label: this.master2NameFieldLabel,
        cellAttributes: { alignment: 'center' }
      });
      this.junctionObjectFieldInfos.forEach(field => {
        if (field.createable) {
          let fieldIsRequired = (field.required && field.dataType !== "Boolean")
          columns.push({
            fieldName: field.apiName,
            label: field.label,
            type: "inputFieldType",
            wrapText: true,
            editable: true,
            typeAttributes: {
              recordId: { fieldName: "Id" },
              objectName: this.junctionObjectName,
              fieldName: field.apiName,
              fieldValue: { fieldName: field.apiName },
              isRequired: fieldIsRequired
            }
          });
        }
      });
      columns.push({
        label: "",
        type: "button-icon",
        initialWidth: 60,
        typeAttributes: {
          iconName: "utility:delete",
          disabled: this.disableDeleteAction,
          title: "delete",
          variant: "border-filled",
          alternativeText: "delete"
        },
        cellAttributes: { alignment: 'left' }
      });
      return columns;
    }
    return [];
  }

  /**
   * get records
   */
  get records() {
    if (this.junctionObjectRecords) {
      return this.junctionObjectRecords;
    }
    return [];
  }

  /**
  * get errors
  */
  get errors() {
    let rows = {}
    this._records.forEach(record => {
      let blankRequiredFields = []
      let blankRequiredFieldLabels = []
      this.columns.forEach(column => {
        if (column.typeAttributes && column.typeAttributes.isRequired && !record[column.fieldName]) {
          blankRequiredFields.push(column.fieldName)
          blankRequiredFieldLabels.push(column.label)
        }
      })
      if (blankRequiredFields.length) {
        rows[record.Id] = {
          fieldNames: blankRequiredFields
        }
        if (this.displayErrors) {
          rows[record.Id].title = `Errors on this record`
          rows[record.Id].messages = [
            `Please enter a value the following the required fields : ${blankRequiredFieldLabels.join(',')}`,
          ]
        }
      }
    })
    return {
      rows
    }
  }
}
