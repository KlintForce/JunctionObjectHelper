import { createElement } from "lwc";
import MasterObjectSetup from "c/masterObjectSetup";

const mockJunctionObjectDetail = require("./data/junctionObjectDetail.json");

describe("c-master-object-setup", () => {
  afterEach(() => {
    // The jsdom instance is shared across test cases in a single file so reset the DOM
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it("Test render master object setup", () => {
    const element = createElement("c-master-object-setup", {
      is: MasterObjectSetup
    });

    element.junctionObjectDetail = mockJunctionObjectDetail;
    element.mainMaster = "master1";
    element.relatedMaster = "master2";

    document.body.appendChild(element);

    let gotoSetupLink = element.shadowRoot.querySelector(
      "[data-id='go-to-setup-link']"
    );
    let setupTitle = element.shadowRoot.querySelector(
      "[data-id='setup-title']"
    );
    let setupAddButton = element.shadowRoot.querySelector(
      "[data-id='setup-add-button']"
    );
    let setupEditButton = element.shadowRoot.querySelector(
      "[data-id='setup-edit-button']"
    );

    // check setup link
    expect(gotoSetupLink.getAttribute("href")).toBe(
      "/lightning/setup/ObjectManager/Account/PageLayouts/view"
    );
    // check setup title
    expect(setupTitle.textContent).toContain("AccountContacts");
    // check setup add button
    expect(setupAddButton.textContent).toContain("Add Contacts");
    // check setup edit button
    expect(setupEditButton.textContent).toContain("Edit Contacts");
  });
});
