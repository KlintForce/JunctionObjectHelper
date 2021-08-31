import { LightningElement, wire } from "lwc";
import listJunctionObjects from "@salesforce/apex/JunctionObjectHelper.listJunctionObjects";
import RESOURCES from "@salesforce/resourceUrl/junctionObjectHelper";
import { ShowToastEvent } from "lightning/platformShowToastEvent";

/**
 * Junction Object Helper setup tab component
 */
export default class JunctionObjectHelperSetup extends LightningElement {
  columns = [
    {
      label: "Junction Object Name",
      type: "button",
      typeAttributes: {
        variant: "brand-outline",
        label: { fieldName: "junctionLabel" },
        name: "junctionObject"
      }
    },
    {
      label: "Master 1 Name",
      type: "button",
      typeAttributes: {
        variant: "brand-outline",
        label: { fieldName: "master1Label" },
        name: "master1"
      }
    },
    {
      label: "Master 2 Name",
      type: "button",
      typeAttributes: {
        variant: "brand-outline",
        label: { fieldName: "master2Label" },
        name: "master2"
      }
    }
  ];
  data = [];
  junctionObjectDetails;
  selectedJunctionObjectDetail;
  selectedObjectName;
  isLoading = true;
  setup = "";

  /**
   * wire list all junction objects of the org
   */
  @wire(listJunctionObjects, {})
  loadRecord({ error, data }) {
    if (error) {
      // display a toast error
      this.showToast("Sorry an error occured while detecting the junction objects","","error");
      this.isLoading = false;
    } else if (data) {
      this.junctionObjectDetails = data;
      this.data = this.junctionObjectDetails.map(record => {
        let recordOutput = {};
        recordOutput.id = record.name;
        recordOutput.junctionLabel = record.label + " ⚙️";
        recordOutput.master1Label = record.master1.label + " ⚙️";
        recordOutput.master2Label = record.master2.label + " ⚙️";
        return recordOutput;
      });
      this.isLoading = false; // loaded
      this.displayToast(this.data.length);
    }
  }

  /**
   * handle row action on the datatable
   * @param {*} evt
   */
  handleRowAction(evt) {
    let objectname = evt.detail.row.id;
    this.setup = evt.detail.action.name;
    let selectedJunctionObjectDetails = this.junctionObjectDetails.filter(
      record => {
        return record.name === objectname;
      }
    );
    if (selectedJunctionObjectDetails.length) {
      this.selectedJunctionObjectDetail = selectedJunctionObjectDetails[0];
      this.selectedObjectName = this.selectedJunctionObjectDetail.name;
    }
  }

  /**
   * handle back button click
   */
  handleBack() {
    this.setup = "";
  }

  /**
   * display a toast to notifiy the user on how many junction objects were detected
   * @param {*} nbJunctionObjects number of junction objects
   */
  displayToast(nbJunctionObjects) {
    if (nbJunctionObjects) {
      if (nbJunctionObjects === 1) {
        this.showToast(`1 junction object detected 🗸`, "", "info");
      } else {
        this.showToast(
          `${nbJunctionObjects} junction objects detected 🗸`,
          "",
          "info"
        );
      }
    } else {
      this.showToast("No junction object detected 🗸", "", "info");
    }
  }

  /**
   * show toast
   */
  showToast(title, message, variant) {
    const evt = new ShowToastEvent({
      title,
      message,
      variant
    });
    this.dispatchEvent(evt);
  }

  /**
   * true if no setup assistant to show
   */
  get noSetup() {
    return this.setup === "";
  }

  /**
   * true to display junction object setup assistant
   */
  get setupJunctionObject() {
    return this.setup === "junctionObject";
  }

  /**
   * true to display master 1 object setup assistant
   */
  get setupMaster1() {
    return this.setup === "master1";
  }

  /**
   * true to display master 2 object setup assistant
   */
  get setupMaster2() {
    return this.setup === "master2";
  }

  /**
   * setup image url from the static resource
   */
  get setupImageURL() {
    return RESOURCES + "/setup.png";
  }
}
