import { LightningElement, api } from "lwc";

/**
 * input field type
 */
export default class inputFieldType extends LightningElement {
  @api recordId;
  @api objectName;
  @api fieldName;
  @api fieldValue;

  /**
   * handle input field change
   * @param {*} evt : event
   */
  handleChange(evt) {
    let value = evt.detail.value || evt.detail.checked;
    // event on input field change
    const inputfieldchange = new CustomEvent("inputfieldchange", {
      composed: true,
      bubbles: true,
      cancelable: true,
      detail: {
        values: { Id: this.recordId, [this.fieldName]: value }
      }
    });
    // fire event
    this.dispatchEvent(inputfieldchange);
  }
}
