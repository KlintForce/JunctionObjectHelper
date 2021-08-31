import LightningDatatable from "lightning/datatable";
import inputFieldType from "./inputFieldType.html";

/**
 * edit form datatable (extends the Lightning datatable)
 */
export default class editFormDatatable extends LightningDatatable {
  static customTypes = {
    inputFieldType: {
      template: inputFieldType, // custom type
      typeAttributes: ["recordId", "objectName", "fieldName", "fieldValue"] // custom attributes
    }
  };
}
