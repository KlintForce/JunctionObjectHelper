({
  /**
   * on render event
   * call the refresh data on the LWC component
   * @param {*} component
   */
  onRender: function(component) {
    let addJunctionRecordsModal = component.find("addJunctionRecordsModal");
    let addJunctionRecordsModalElement = addJunctionRecordsModal.getElement();
    addJunctionRecordsModalElement.refreshData(); // refresh data
  },
  /**
   * on redirect event
   * redirect back to the master 1 record
   * @param {*} component
   * @param {*} event
   */
  onRedirect: function(component, event) {
    let redirectionService = component.find("redirectionService");
    redirectionService.redirect(event.getParam("recordId"));
  }
});
