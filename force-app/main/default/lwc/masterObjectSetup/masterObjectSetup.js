import { LightningElement, api } from "lwc";

/**
 * master object setup assistant
 */
export default class MasterObjectSetup extends LightningElement {
  @api junctionObjectDetail;
  @api mainMaster;
  @api relatedMaster;

  /**
   * get a link that goes to setup -> object manager -> main master -> page layouts
   */
  get mainMasterPageLayoutsLink() {
    return `/lightning/setup/ObjectManager/${this.junctionObjectDetail[this.mainMaster].durableId}/PageLayouts/view`;
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
