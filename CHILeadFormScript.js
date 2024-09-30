function openSpecificForm(e) {
    // Get the Form Context
    var formContext = e.getFormContext();

    // variable to store the name of the form
    var formType;

    // get the value of the picklist field
    var leadType = formContext.getAttribute("chi_leadtype").getValue();
    // switch statement to assign the form to the picklist value
    // update the switch statement with the new form requirements
    switch (leadType) {
        case 214680000: // Dealer Prospect
            formType = "CHI Lead";
            break;
        case 126720000: // Homeowner
        case 214680001: // Door Owner
        case 126720002: // Other
            formType = "Digital Marketing Lead";
            break;
        default:
            formType = "CHI Lead";
    }

    // check if the current form is the form that needs to be displayed based on the value
    if (formContext.ui.formSelector.getCurrentItem().getLabel() != formType) {
        var items = formContext.ui.formSelector.items.get();
        for (var i in items) {
            var item = items[i];
            var itemId = item.getId();
            var itemLabel = item.getLabel();

            if (itemLabel == formType) {
                // navigate to the form
                item.navigate();
                break; // Exit the loop once the form is found and navigated to
            }
        }
    }
}

function disableFormSelector(executionContext) {
    var formContext = executionContext.getFormContext();
    formContext.ui.formSelector.items.forEach(
        function(form) {
            form.setVisible(false);
        }
    );
}

function lockUnlockFields(executionContext) {
    var formContext = executionContext.getFormContext();
    var leadsourceAttribute = formContext.getAttribute("syn_leadsource");

    if (leadsourceAttribute != null) {
        var leadsource = leadsourceAttribute.getValue();

        if (leadsource === 214680001 || leadsource === "Digital/Website") {
            setControlsDisabled(formContext, true);
        } else {
            setControlsDisabled(formContext, false);
        }
    }
}

function setControlsDisabled(formContext, isDisabled) {
    var controlsToDisable = ["companyname", "syn_contactname", "chi_leadtype"];

    controlsToDisable.forEach(function(controlName) {
        var control = formContext.getControl(controlName);
        if (control != null) {
            control.setDisabled(isDisabled);
        }
    });
}

// JavaScript source code
function dealerProspectLeadFieldsHide(executionContext) { 
    var formContext = executionContext.getFormContext();
    var leadType = formContext.getAttribute("chi_leadtype").getValue();
    if (leadType == 214680000 || leadType == "Dealer Prospect") {
        formContext.getControl("iprm_partner").setVisible(false);
        formContext.getControl("iprm_partnermember").setVisible(false);

    } 
    else{
        formContext.getControl("iprm_partner").setVisible(true);
        formContext.getControl("iprm_partnermember").setVisible(true);          
} 
}

function isUserSysAdmin() {
    var value = false;
    var systemAdminRoleGuid = "48da5592-2509-e611-80e6-5065f38a5be1";
    var userRoles = Xrm.Utility.getGlobalContext().userSettings.securityRoles;
    for (var i = 0; i < userRoles.length; i++) {
        if (userRoles[i].toUpperCase() === systemAdminRoleGuid.toUpperCase()) {
            value = true;
            break;
        }
    }
    return value;
}

function onDealerChange(executionContext) {
    var formContext = executionContext.getFormContext();
    var dealer = formContext.getAttribute("iprm_partner").getValue();

    if (dealer) {
        var dealerId = dealer[0].id.replace("{", "").replace("}", "");

        var fetchXml = [
            "<fetch>",
            "  <entity name='contact'>",
            "    <attribute name='fullname' />",
            "    <attribute name='contactid' />",
            "    <filter>",
            "      <condition attribute='accountid' operator='eq' value='", dealerId, "'/>",
            "      <condition attribute='cgrn_isleadcontact' operator='eq' value='1'/>",
            "    </filter>",
            "  </entity>",
            "</fetch>"
        ].join("");

        Xrm.WebApi.retrieveMultipleRecords("contact", "?fetchXml=" + encodeURIComponent(fetchXml)).then(
            function success(result) {
                if (result.entities.length > 0) {
                    var contact = result.entities[0];
                    var contactId = contact.contactid;

                    formContext.getAttribute("iprm_partnermember").setValue([{
                        id: contactId,
                        name: contact.fullname,
                        entityType: "contact"
                    }]);
                } else {
                    formContext.getAttribute("iprm_partnermember").setValue(null);
                }
            },
            function error(error) {
                console.log("Error in retrieving contacts: " + error.message);
            }
        );
    } else {
        formContext.getAttribute("iprm_partnermember").setValue(null);
    }
}

//Hide Project Name in BPF based on LeadType
function toggleSubjectFieldInBPF(executionContext) {
    var formContext = executionContext.getFormContext();
    var leadType = formContext.getAttribute("chi_leadtype").getValue();

    // Get the control for the 'subject' field in the BPF header
    var bpfFieldControl = formContext.getControl("header_process_subject");

    // List of lead types to hide the 'subject' field
    var hiddenLeadTypes = [
        214680000, // Dealer Prospect
       126720000  // Homeowner
    ];

    // Check if the lead type is in the list of hidden lead types
    if (hiddenLeadTypes.includes(leadType)) {
        bpfFieldControl.setVisible(false); // Hide the field
    } else {
        bpfFieldControl.setVisible(true); // Show the field
    }
}
function handleBPFLoad(executionContext) {
    // Call the toggle function on form load
    toggleSubjectFieldInBPF(executionContext);
}
function handleLeadTypeChange(executionContext) {
    // Call the toggle function when the 'lead type' field changes
    toggleSubjectFieldInBPF(executionContext);
}

//Hide first name, last name and section 
function handleFormLoad(executionContext) {
    setRequiredFieldBasedOnLeadType(executionContext);
}
function setRequiredFieldBasedOnLeadType(executionContext) {
    var formContext = executionContext.getFormContext(); // Get form context
    var leadTypeField = formContext.getAttribute("chi_leadtype");
    var firstNameField = formContext.getAttribute("firstname");

    if (leadTypeField && firstNameField) {
        var leadTypeValue = leadTypeField.getValue();
        
        // Check if lead type is Residential Builder (968480010) or Commercial Project (968480014)
        if (leadTypeValue === 968480010 || leadTypeValue === 968480014) {
            // Set 'firstname' field as not required
            firstNameField.setRequiredLevel("none");
        } else {
            // Set 'firstname' field back to required if not Residential Builder or Commercial Project
            firstNameField.setRequiredLevel("required");
        }
    }
}
function onLeadTypeChange(executionContext) {
    setRequiredFieldBasedOnLeadType(executionContext);
}

function hideCommercialProjectDetails(executionContext) {

    var formContext = executionContext.getFormContext();

    var leadType = formContext.getAttribute("chi_leadtype").getValue();

    // Section where Home Owner Details are placed
    var homeOwnerSection = formContext.ui.tabs.get("Summary").sections.get("Summary_section_13");

    // Fields to hide: firstname and lastname
    var firstNameField = formContext.getControl("firstname");
    var lastNameField = formContext.getControl("lastname");

    // Option set values for Commercial Project and Residential Builder
    if (leadType == 968480014 || leadType == 968480010) {
        // Hide the Home Owner Details section
        homeOwnerSection.setVisible(false);

        // Hide the firstname and lastname fields
        firstNameField.setVisible(false);
        lastNameField.setVisible(false);
    } else {
        // Show the Home Owner Details section
        homeOwnerSection.setVisible(true);

        // Show the firstname and lastname fields
        firstNameField.setVisible(true);
        lastNameField.setVisible(true);
    }
}

// Renamed onload function
function handleFormLoad(executionContext) {
    hideCommercialProjectDetails(executionContext);
}

// Renamed onchange function to avoid conflicts
function handleLeadTypeChangeNew(executionContext) {
    hideCommercialProjectDetails(executionContext);
}