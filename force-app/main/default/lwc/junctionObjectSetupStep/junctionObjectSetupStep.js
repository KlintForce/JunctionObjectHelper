import { LightningElement, api } from "lwc";

/**
 * step in junction object setup assistant
 */
export default class JunctionObjectSetupStep extends LightningElement {
  @api junctionObjectDetail;
  @api verbe;
  @api mainMaster;
  @api relatedMaster;
  @api step;

  /**
   * handle copy click
   * @param {*} evt
   */
  handleCopy(evt) {
    evt.target.iconName = "utility:check";
    this.copyToClipboard(this.buttonLink);
  }

  /**
   * copy the value to the clipboard
   * @param {*} value value to copy
   */
  copyToClipboard(value) {
    var inputCopy = document.createElement("input");
    inputCopy.setAttribute("value", value);
    document.body.appendChild(inputCopy);
    inputCopy.select();
    document.execCommand("copy");
    document.body.removeChild(inputCopy);
  }

  /**
   * get the capitalized verbe
   */
  get capitalizedVerbe() {
    if (this.verbe) {
      return this.verbe.charAt(0).toUpperCase() + this.verbe.slice(1);
    }
    return "";
  }

  /**
   * get a link that goes to setup -> object manager -> junction object -> buttons and actions
   */
  get junctionObjectButtonsLinksActionsLink() {
    return `/lightning/setup/ObjectManager/${this.junctionObjectDetail.durableId}/ButtonsLinksActions/view`;
  }

  /**
   * get a link that goes add/edit junction records lightning component
   */
  get buttonLink() {
    return `/lightning/cmp/efrontforce__${this.verbe}JunctionRecords?c__recordId={!${this.junctionObjectDetail[this.mainMaster].name}.Id}&c__junctionObjectName=${this.junctionObjectDetail.name}`;
  }

  /**
   * get the label of the main master
   */
  get mainMasterLabel() {
    return this.junctionObjectDetail[this.mainMaster].label;
  }

  /**
   * get the plural label of the related master
   */
  get relatedMasterLabelPlural() {
    return this.junctionObjectDetail[this.relatedMaster].labelPlural;
  }
}
