function hideQuotesOrdersTabsForDealerProspect(executionContext) {
    var formContext = executionContext.getFormContext();

    // Check if the Customer ID (cgrn_customerid) is null or empty
    if (formContext.getAttribute("cgrn_customerid") == null || formContext.getAttribute("cgrn_customerid").getValue() == null) {
        
        // Check if the OriginatingLeadId exists and has a value
        if (formContext.getAttribute("originatingleadid") != null && formContext.getAttribute("originatingleadid").getValue() != null) {
            var leadId = formContext.getAttribute("originatingleadid").getValue();
            
            // Get the Lead ID
            var leadGuid = leadId[0].id.replace("{", "").replace("}", "");

            // Call the Web API to retrieve the Lead Type (chi_leadtype) from the Lead entity
            Xrm.WebApi.retrieveRecord("lead", leadGuid, "?$select=chi_leadtype").then(
                function (result) {
                    var leadType = result["chi_leadtype"];

                    // If Lead Type is Dealer Prospect (214680000) and Customer ID is null, hide the tabs
                    if (leadType === 214680000) {
                        formContext.ui.tabs.get("QUOTES").setVisible(false);
                        formContext.ui.tabs.get("Order").setVisible(false);
                    }
                }
            );
        }
    }
}

function lockBPFFieldToolTip() {
    // Access the field from the BPF header using Xrm.Page
    var bpfToolTipFieldControl = Xrm.Page.getControl("header_process_cgrn_tooltip");
    
    // Lock the field if it exists
    if (bpfToolTipFieldControl) {
        bpfToolTipFieldControl.setDisabled(true);
    }
}

