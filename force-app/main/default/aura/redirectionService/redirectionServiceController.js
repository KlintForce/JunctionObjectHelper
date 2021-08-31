({
  /**
   * redirect to an sObject using workspaceAPI or force:navigateToSObject
   * @param {*} component
   * @param {*} event
   */
  redirectToSObject: function(component, event) {
    const params = event.getParam("arguments");
    let workspaceAPI = component.find("workspace");
    workspaceAPI
      .isConsoleNavigation()
      .then(function(response) {
        if (response) {
          workspaceAPI
            .getFocusedTabInfo()
            .then(function(response) {
              let focusedTabId = response.tabId;
              workspaceAPI
                .openTab({
                  pageReference: {
                    type: "standard__recordPage",
                    attributes: {
                      recordId: params.recordId,
                      actionName: "view"
                    },
                    state: {}
                  },
                  focFus: true
                })
                .then(function() {
                  workspaceAPI.closeTab({ tabId: focusedTabId });
                })
                .catch(function(error) {
                  console.log(error);
                });
            })
            .catch(function(error) {
              console.log(error);
            });
        } else {
          let navEvent = $A.get("e.force:navigateToSObject");
          navEvent.setParams({
            recordId: params.recordId,
            slideDevName: "detail"
          });
          navEvent.fire();
        }
      })
      .catch(function(error) {
        console.log(error);
      });
  }
});
