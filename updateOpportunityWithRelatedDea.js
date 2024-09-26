function updateOpportunityWithRelatedDealerAccountNumber(executionContext) {
    // Retrieve the opportunity ID from the opportunity form
    var formContext = executionContext.getFormContext();
    var opportunityId = formContext.data.entity.getId();
   
    // Retrieve Opportunity record
    Xrm.WebApi.retrieveRecord("opportunity", opportunityId, "?$select=cgrn_customerid&$expand=originatingleadid($select=syn_relatedaccountdealer")
.then(
        function(opportunityEntity) {
            console.log("Opportunity retrieved successfully:", opportunityEntity);

            // Check if originatingleadid exists and has syn_relatedaccountdealer property
            if (opportunityEntity.originatingleadid != null && opportunityEntity.originatingleadid.syn_relatedaccountdealer != null) {
                var relatedDealerAccount = opportunityEntity.originatingleadid.syn_relatedaccountdealer;
                console.log("Related Dealer Account:", relatedDealerAccount);

                var relatedDealerAccountNumber = relatedDealerAccount.accountnumber;
                console.log("Related Dealer Account Number:", relatedDealerAccountNumber);

                // Set the value of the opportunity field to the related dealer's account number
                opportunityEntity.cgrn_customerid = relatedDealerAccountNumber;

                // Update the Opportunity record
                Xrm.WebApi.updateRecord("opportunity", opportunityId, opportunityEntity).then(
                    function success(result) {
                        console.log("Opportunity updated successfully.");
                    },
                    function(error) {
                        console.log("Error updating Opportunity:", error.message);
                    }
                );
            } else {
                console.log("Related dealer account information not found.");
            }
        },
        function(error) {
            console.log("Error retrieving Opportunity:", error.message);
        }
    );
}
