function qualifyButtonSystemAdmin() {
    var value = false;
    var constsystemAdminGuid = "7b10BF70E4-32AC-EE11-A569-000D3A0A75A6";
    var userRoles = Xrm.Utility.getGlobalContext().userSettings.securityRoles;
    for (var i = 0; i < userRoles.length; i++) {
    if (userRoles.toUpperCase() == constsystemAdminGuid.toUpperCase()) {
    value = true;
    break;
    }
    }
    return value;
    }