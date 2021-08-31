({
  /**
   * on render event
   * call the refresh data on the LWC component
   * @param {*} component
   */
  onRender: function(component) {
    let editJunctionRecordsModal = component.find("editJunctionRecordsModal");
    let editJunctionRecordsModalElement = editJunctionRecordsModal.getElement();
    editJunctionRecordsModalElement.refreshData(); // refresh data
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
