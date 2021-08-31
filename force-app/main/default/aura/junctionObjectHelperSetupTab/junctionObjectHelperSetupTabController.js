({
  /**
   * doInit event
   * set the label and icon of the tab when console mode is detected
   * @param {*} component
   */
  doInit: function(component) {
    let workspaceAPI = component.find("workspace");
    workspaceAPI
      .isConsoleNavigation()
      .then(function(response) {
        if (response) {
          workspaceAPI
            .getFocusedTabInfo()
            .then(function(response) {
              let focusedTabId = response.tabId;
              workspaceAPI.setTabLabel({
                tabId: focusedTabId,
                label: "JunctionObjectHelper Setup"
              });
              workspaceAPI.setTabIcon({
                tabId: focusedTabId,
                icon: "utility:setup",
                iconAlt: "Setup"
              });
            })
            .catch(function(error) {
              console.log(error);
            });
        }
      })
      .catch(function(error) {
        console.log(error);
      });
  }
});
