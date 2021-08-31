import { createElement } from "lwc";
import JunctionObjectSetupStep from "c/junctionObjectSetupStep";

const mockJunctionObjectDetail = require("./data/junctionObjectDetail.json");

describe("c-junction-object-setup-step", () => {
  afterEach(() => {
    // The jsdom instance is shared across test cases in a single file so reset the DOM
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
    document.execCommand = jest.fn();
  });

  it("Test render junction object setup step", () => {
    const element = createElement("c-junction-object-setup-step", {
      is: JunctionObjectSetupStep
    });

    element.junctionObjectDetail = mockJunctionObjectDetail;
    element.verbe = "add";
    element.mainMaster = "master1";
    element.relatedMaster = "master2";
    element.step = "1";

    document.body.appendChild(element);

    let gotoSetupLink = element.shadowRoot.querySelector(
      "[data-id='go-to-setup-link']"
    );
    // check setup link
    expect(gotoSetupLink.getAttribute("href")).toBe(
      "/lightning/setup/ObjectManager/01I3N000000H2Tf/ButtonsLinksActions/view"
    );
  });

  it("Test click to copy", () => {
    const element = createElement("c-junction-object-setup-step", {
      is: JunctionObjectSetupStep
    });

    element.junctionObjectDetail = mockJunctionObjectDetail;
    element.verbe = "add";
    element.mainMaster = "master1";
    element.relatedMaster = "master2";
    element.step = "1";

    document.body.appendChild(element);

    let copyButton = element.shadowRoot.querySelector(
      "[data-id='copy-button']"
    );
    copyButton.dispatchEvent(new CustomEvent("click"));
    // check icon changed
    expect(copyButton.iconName).toBe("utility:check");
  });
});
